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

Trying to find a rough estimate of what could be app limits using empirical "fail & retry" strategy.

Testing server app behavior when scaling on multiple instances behind default service loadbalancer.

/!\ socket.io requires sticky session when running on multiple instances. It seems not really stateless : it creates multiple server "routines" at each socket call, so we're seeing more clients on server-side than requested ...

/!\ default k8s service only provides clientIP stickiness. This is not enough in our case because we have only 1 client instance running all 200 connections (from the same internal IP)

* Adding prometheus library to server app + registering some useful metrics
* Setup fluxv2 + prometheus stack
* Adding a super-duper dashboard dedicated to the server app (+ many other community available ones). Store it kube in a CM.
* Installing Kubernetes Event Driven Autoscaler ... because this is the way ( and the overall goal here :-D )
* Adding a scaling rule based on the total active connections on server app
* Implementing a readiness/liveness http endpoint in server app to help LB during scaling maneuvers
* Tuning (a bit) app container requests & limits to make everything fit on my laptop
* 

## how to
_Tested & validated on ubuntu 20.04.2 + microk8s (containerd 1.3.7 + kube 1.20.6)_
```bash
# install microk8s
sudo snap install microk8s --classic
microk8s enable dns registry

# build and push applications to the local microk8s registry
docker build -f server/Dockerfile -t localhost:32000/server ./server/ && docker push localhost:32000/server
docker build -f client/Dockerfile -t localhost:32000/client ./client/ && docker push localhost:32000/client

# install platform requirements
kubectl apply -k k8s/platform
kubectl apply -k k8s/platform # a second time is required a couple second after because of CRD chicken-and-egg issue 

# wait for all system containers and controllers to be started and ready ...

# install mx client & server
kubectl apply -k k8s/mx-app

# to visualize dashboards :
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# now you can visit
http://127.0.0.1:3000 # credentials = admin / admin
```
