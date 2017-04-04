git add .
git commit -m "deploy better"

heroku login

heroku git:remote -a zentomic-notifier-node

git push heroku master

git remote add origin https://github.com/Zentomic/zentomic-notifier-node.git

git remote -v

git push origin master --force