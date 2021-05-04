# mx-scaler

## worklog

* Copy exercice code 
* add .gitignore
* Create Dockerfile for each app

Dependencies were pointing to something that seems to be a private npm cache repo.

I had to fallback to npmjs.org

Using cache repo is a good practise to avoid spamming npmjs & being ratelimited (or even blacklisted)... but I'm not allowed to get into it due to auth issues.

Checking if all versions are pinned at the same version as original file.

Checking if there's no "real" private missing package.

Starting apps with `node index.js` instead of `node server` & `node client`

Fix package.json + add a startup log line to the client app to avoid keeping it silent too long

* Starting to describe apps as kubernetes API object
* Using ENV var for configuration in client app
* Expose server app in a kube service, making everything works in a single instance only model

## how to
