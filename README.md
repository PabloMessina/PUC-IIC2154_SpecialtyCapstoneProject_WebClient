# WebAdmin

Admin web client of [RESTAPI](https://github.com/iic2154-uc-cl/2016-1-Grupo5-RESTAPI) built with [React.js](https://facebook.github.io/react/).

[![wercker status](https://app.wercker.com/status/f23071916b4987c34cae85e38ec7aa45/m "wercker status")](https://app.wercker.com/project/bykey/f23071916b4987c34cae85e38ec7aa45)

## Development

Clone this repository and name it `web-admin`:

```sh
git clone https://github.com/iic2154-uc-cl/2016-1-Grupo5-WebAdmin.git web-admin
cd web-admin
```

### Features

> See [danielkummer/git-flow-cheatsheet#features](https://danielkummer.github.io/git-flow-cheatsheet/#features), but **skip** the `git flow feature finish`. We will use [**Pull-Requests**](https://help.github.com/articles/using-pull-requests/) to allow a code review process.

#### Creating a feature

As a example, let's say we want to develop the _**`login`**_ feature:

```sh
# Create feature branch
git flow feature start login

# Publish feature, so other members can collaborate and review it
git flow feature publish login
```

This will create the `feature/login` branch.

> To change between branches remember `git checkout BRANCH_NAME`. Also remember `git stash` to save changes on _'your pocket'_ and `git stash pop` to bring them back.

#### Working on a feature

If a member has to work on that feature, he must _pull_ it using:

```sh
git flow feature pull origin login
```

To sync between members on this feature, remember `git pull`.

Make some changes and then commit as usual with `git add`, `git commit` and `git push`.

#### Finishing and reviewing a feature

See this video from `0:00` to `3:47`

[![Github and pull-requests](http://img.youtube.com/vi/mcWsX_setW4-Y/0.jpg)](https://www.youtube.com/watch?v=mcWsX_setW4-Y "Github and pull-requests")
