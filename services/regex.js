// services/regex.js


//regex contre les injections de scripts et de balises htms
const scriptInjectionRegex = /<([a-z][\s\S]*?)\s*on\w+\s*=\s*['"][\s\S]*?['"][^>]*>|<[^>]+>/gi;

module.exports = { scriptInjectionRegex };
                 