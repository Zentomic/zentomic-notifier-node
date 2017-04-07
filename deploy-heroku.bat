git add .

git commit -m "deploy heroku zentomic notifier node better"

heroku login

heroku apps:destroy --app zentomic-notifier-node

heroku apps:create zentomic-notifier-node

heroku git:remote -a zentomic-notifier-node

git push heroku master
