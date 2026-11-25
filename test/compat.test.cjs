const test=require('node:test'),assert=require('node:assert/strict');
const old=require('./original.cjs'),api=require('../index.cjs');
async function run(impl,header,env,verdict){
 const calls=[]; const guard=impl.buildCredentialGuard({bus:{async pipeline(event,v,ctx){calls.push([event,v,ctx.pkg,ctx.token]);return verdict===undefined?v:verdict}}},'my-package',{env});
 const response={status(s){calls.push(s);return this},json(b){calls.push(b);return b}};
 const result=await guard({headers:{authorization:header}},response,()=>{calls.push('next');return 7});
 return {calls,result};
}
test('guard matches original for acceptance, denial and pipeline overrides',async()=>{
 for(const header of [undefined,'','Bearer good','Bearer bad','bearer good','Basic good'])
 for(const env of [{},{AUTH_TOKEN:'good'},{MY_PACKAGE_ENV_AUTH_TOKEN:'good',AUTH_TOKEN:'other'}])
 for(const verdict of [undefined,null,{allowed:true},{allowed:false,status:403,message:'denied'}])
 assert.deepEqual(await run(api,header,env,verdict),await run(old,header,env,verdict));
});
test('API and state installation are preserved',()=>{
 assert.deepEqual(Object.keys(api).sort(),Object.keys(old).sort());
 const state=new Map();assert.equal(api.createCredentialModule().install({state(n){assert.equal(n,'credential');return state}}),undefined);
 assert.equal(typeof state.get('buildGuard'),'function');
});
test('pipeline errors propagate',async()=>{
 const guard=api.buildCredentialGuard({bus:{pipeline(){throw Error('failure')}}},'app',{env:{}});
 await assert.rejects(guard({headers:{}},{},()=>{}),/failure/);
});
