# euro-auto-center.com redirect (Azure Static Web App, Free plan)
Second Static Web App whose only job is a permanent 301 redirect of www.euro-auto-center.com (and later euro-auto-center.com) to https://www.euroautocenterllc.com.
- App location: `/redirect`, no build, output `.`.
- DNS (Route 53, by Wise): `www` CNAME -> <redirect app>.azurestaticapps.net (custom-domain validation is done by the CNAME itself).
- Email records (MX, SPF, DKIM, DMARC) are not touched.
