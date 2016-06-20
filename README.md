# WebClient

Web client of [RESTAPI](https://github.com/iic2154-uc-cl/2016-1-Grupo5-RESTAPI) built with [React.js](https://facebook.github.io/react/).

[![wercker status](https://app.wercker.com/status/7d071f233c5de3a0b4bc7f7579b323cd/m "wercker status")](https://app.wercker.com/project/bykey/7d071f233c5de3a0b4bc7f7579b323cd)

## Development

Clone this repository and name it `web-client`:

```sh
git clone https://github.com/iic2154-uc-cl/2016-1-Grupo5-WebClient.git web-client
cd web-client

# Move to the develop branch
git checkout develop
```

### Setup

Make sure you have installed [Node 6.x](https://nodejs.org/en/).

Install project dependencies:

```sh
npm install
```

You can see the project dependencies and their versions by reading [package.json](/package.json) or by typing (once installed):
```sh
npm list
```

To update to higher versions:

```sh
npm update
```

### Running

Start the development server on [`http://localhost:3000`](http://localhost:3000/) with:

```sh
npm start

# or more explicit:
npm run start:dev
```

> You can debug it with your browser's debugger

### Deployment

This project uses [Docker](https://docs.docker.com/engine/quickstart/) and [Docker Compose](https://docs.docker.com/compose/) to setup then production environment.

Also, create an account on [New Relic](https://newrelic.com/) and get an API KEY Token.

Clone this repository and go to the `master` branch:

```sh
git clone https://github.com/iic2154-uc-cl/2016-1-Grupo5-WebClient.git web-client
cd web-client

# Move to the develop branch
git checkout master
```

Some environment variables have to be set. You can do this (and don't lose them after reboot) with:

```sh
# Change to ~/.zshrc if using zsh
nano ~/.bashrc
```

```sh
# New Relic API KEY
export NEW_RELIC_LICENSE_KEY="NEW_RELIC_ORGANIZATION_KEY"
```

```sh
# Change to ~/.zshrc if using zsh
source ~/.bashrc
```

Edit [`docker-compose.yml`](docker-compose.yml) depending on your needs. Once ready:

```sh
# Start databases
docker-compose up -d
```

To stop the application:

```sh
# Stop all containers
docker-compose stop

# Remove all containers
docker-compose rm
```

To update an existent container of this app:

```sh
# Kill containers
docker-compose stop web-client
docker-compose rm web-client

# Update the repository
git pull

# Re-build and run container
docker-compose up -d
```

To scale this application:

```sh
docker-compose scale web-client=2
```

> See https://docs.docker.com/compose/overview/
