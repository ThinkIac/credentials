var buildCredentialGuard, createCredentialModule, createHost, credentialModule, expectedCredential, provideCredential, toEnvSegment;

toEnvSegment = function(value) {
  return String(value).replace(/[^A-Za-z0-9]/g, '_').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
};

expectedCredential = function(pkgFolder, env = process.env) {
  return env[`${toEnvSegment(pkgFolder)}_ENV_AUTH_TOKEN`] || env.AUTH_TOKEN || null;
};

buildCredentialGuard = function(container, pkgFolder, {env = process.env} = {}) {
  return async function(req, res, next) {
    var expected, header, ref, ref1, ref2, token, verdict;
    header = ((ref = req.headers) != null ? ref.authorization : void 0) || '';
    token = header.startsWith('Bearer ') ? header.slice(7) : null;
    expected = expectedCredential(pkgFolder, env);
    verdict = {
      allowed: Boolean(expected) && token === expected,
      status: 401,
      message: expected ? 'Invalid or missing bearer credential' : 'Credential token not configured for this package'
    };
    verdict = (await container.bus.pipeline('credential:verify', verdict, {
      req,
      res,
      pkg: pkgFolder,
      token
    }));
    if (verdict != null ? verdict.allowed : void 0) {
      return next();
    }
    return res.status((ref2 = verdict != null ? verdict.status : void 0) != null ? ref2 : 401).json({
      error: (ref1 = verdict != null ? verdict.message : void 0) != null ? ref1 : 'Credential rejected'
    });
  };
};

createCredentialModule = function(options) {
  return {
    name: 'credential',
    phase: 'boot',
    install: function(container) {
      container.state('credential').set('buildGuard', function(pkgFolder) {
        return buildCredentialGuard(container, pkgFolder, options);
      });
    }
  };
};

credentialModule = createCredentialModule();

provideCredential = function(host) {
  return {
    /*
    @register module credential
    @context capability
    */
    name: 'credential',
    phase: 'boot',
    install: function() {
      createCredentialModule().install({
        state: host.state,
        bus: {
          pipeline: host.pipeline
        }
      });
    }
  };
};

createHost = function(...args) {
  return require('@thinkiac/module-runtime-compat').createHost(...args);
};

module.exports = {
  toEnvSegment,
  expectedCredential,
  buildCredentialGuard,
  createCredentialModule,
  credentialModule,
  provideCredential,
  createHost,
  createRuntimeModule: provideCredential
};
