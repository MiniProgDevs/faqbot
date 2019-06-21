#!/usr/bin/env bash

# set -x

## deploy cli v3.1


DEBUG_LEVEL=info

function die() {
  printf "\e[101m ---- ERROR  $1  ---\e[0m"
  printf "\n----- exiting -----\n"
  exit -1
}

function errmsg() {
  printf "\e[101m ---- ERROR  $1  ---\e[0m"
}

function msg() {
  printf "\e[44m ---- $1 ---\e[0m\n"
}

function showHelp() {
  echo "needs a command!
  env - check environment
  qd - quick deploy
  deploy - deploy and npm install
  sync - sync files only
  "
}

# read from a .env file in same directory
function readEnv() {
  msg "------ readEnvNap ------"
  source .env

  DEBUG=*,-express:router*,-express:application,-compression,-body-parser:*,-send,-express:view,-engine*,-socket*,-nodemon*,-WcTokenManager,-superagent,-follow-redirects
  export DEBUG=$DEBUG
  showVars
}


function showVars() {
  msg "---- config ENV ----"
  echo "APP_NAME:           ${APP_NAME}"
  echo "DEPLOY_LOGIN:       ${DEPLOY_LOGIN}"
  echo "DEPLOY_DIR:         ${DEPLOY_DIR}"
  echo "HOST_DOMAIN:        ${HOST_DOMAIN}"
  echo "APP_HOST:           ${APP_HOST}"
  echo "--------- ------ ---------"

}

# public/static are files from another repo
# note this is NOT inside server dir

function syncRemote() {
  msg "------- sync-remote ${APP_NAME} at `date` -------"
  echo "pwd `pwd`"

  # check deploy dir exists
  ssh ${DEPLOY_LOGIN} "mkdir -p ${DEPLOY_DIR}"

  # to do make this a flag only exlcude for quick deploy
  EXCLUDE_MODULES="--exclude node_modules"

  # cos code is in the same directory FFS
  # -avz for verbose
  rsync . -azc  \
      --exclude /build \
      --exclude node_modules \
      --delete \
      --exclude /backups \
      --exclude .git \
      --exclude *.tsx \
      --exclude *.ts \
      --exclude .DS_Store \
      --exclude log/*.log \
      --exclude tests/* \
      --progress \
      -L \
      ${DEPLOY_LOGIN}:$DEPLOY_DIR

  echo 'sync done'

}

# quick build server
function quickBuildLocal() {
  cd server && yarn build
  cd -
}


# buildLocalClient() {
#   msg "---- buildLocalClient ----"
#   msg "build-author"
#   cd author && yarn build
#   cd -
# }

function buildLocalServer() {
  msg "buildLocalServer"
  yarn build
}

# statusRemote() {
#   msg "check deployed.env"
#   ssh ${DEPLOY_LOGIN} "cd $DEPLOY_DIR && head server/deployed.env.sh"
# }

# make modules available locally
# installLocal() {
#   msg "---- installLocal author ----"
#   cd author && yarn install --pure-lockfile
#   cd -

#   msg "---- installLocal server ----"
#   cd server && yarn install --pure-lockfile
#   cd -
# }

function installRemote() {
  msg "--- check remote node version ----"
  ssh ${DEPLOY_LOGIN} "cd ${DEPLOY_DIR} && node -v"

  #### using this when having problems
  # ssh ${DEPLOY_LOGIN} "cd ${DEPLOY_DIR}/author && rm -rf node_modules"
  # ssh ${DEPLOY_LOGIN} "cd ${DEPLOY_DIR}/author && yarn cache clean"
  ### use npm instead of yarn?
  # ssh ${DEPLOY_LOGIN} "cd ${DEPLOY_DIR}/author && cnpm i"

  # ssh ${DEPLOY_LOGIN} "cd ${DEPLOY_DIR}/author && yarn install --pure-lockfile"
  # ssh ${DEPLOY_LOGIN} "cd ${DEPLOY_DIR}/author && npm rebuild"

  ssh ${DEPLOY_LOGIN} "cd ${DEPLOY_DIR} && npm install --pure-lockfile"
  ssh ${DEPLOY_LOGIN} "cd ${DEPLOY_DIR} && npm rebuild"

}



# run command on remote host
function runRemote() {
  msg " runRemote "
  cmd=$1
  echo ">> $1"
  ssh ${DEPLOY_LOGIN} "${cmd}"
}

# delete remote pm2 instance
# needed to flush config vars - cannot just restart
function deleteRemote() {
  msg "--- deleteRemote ---"
  ssh ${DEPLOY_LOGIN} "pm2 delete ${APP_NAME}"
}

# called first time when there is no existing named process
# afterwards we just restart to keep the same pid
function coldStart() {
  msg "--- coldStart ---"
  cmd="cd ${DEPLOY_DIR} && \
    DEBUG_LEVEL=$DEBUG_LEVEL \
    DEBUG=*,-superagent,-middleware*,-lib:misc*,-express:router*,-body-parser:*,-send,-compression,-engine:socket,-engine*,-socket.io*,-feathers* \
    pm2 start process.json --name ${APP_NAME} --env ${APP_ENV}"
  echo $cmd
  runRemote "$cmd"
}

function restartRemote() {
  msg "--- restartRemote ---"
  # deleteRemote
  # runRemote "export DEBUG=*,-express:router,-body-parser:*,-send,-compression,-engine:socket,-engine*,-socket.io*,-feathers*,RiBot*"

  #  [ 'log', 'error', 'warn', 'debug', 'info', 'verbose' ]
  # LOGPATH="/opt/rikai/logs/pm2/${APP_NAME}"
  set -x
  cmd="cd ${DEPLOY_DIR} && \
    DEBUG_LEVEL=$DEBUG_LEVEL \
    DEBUG=*,-superagent,-middleware*,-lib:misc*,-express:router*,-body-parser:*,-send,-compression,-engine:socket,-engine*,-socket.io*,-feathers* \
    pm2 restart process.json --name ${APP_NAME} --env ${APP_ENV}"

  echo $cmd
  runRemote "$cmd"

  # pm2 start server.js --name bot.${APP_NAME} -o $LOGPATH-out.log -e $LOGPATH-err.log"

}

function logRemote() {
  # strip timestamps
  msg "--- logRemote ---"
  ssh ${DEPLOY_LOGIN} "pm2 logs ${APP_NAME}"
  # | sed "s/^.*GMT/- /"
  # | sed "s/^.*GMT/\\`echo -e '\n\r'`/g"
  # set +x

}

# with local install first
# in case of build problems
function fullDeploy() {
  setUpEnv
  readEnv
  msg "--- fullDeploy ---"
  syncRemote
  # installRemote
  # statusRemote
  restartRemote
  msg "--- deploy Done! ----"
  logRemote
}


function deployRemote() {
  setUpEnv
  readEnv
  msg "--- deployRemote ---"
  # installLocal
  # buildLocalClient
  # buildLocalServer
  syncRemote
  installRemote
  # deleteRemote
  restartRemote
  statusRemote
  msg "--- deploy Done! ----"
  logRemote
}

# no react/client build
# just server compile
# but does a yarn install remote
function quickDeploy() {
  setUpEnv
  readEnv
  msg "--- quickDeploy ---"
  buildLocalServer
  # quickBuildLocal
  syncRemote
  # installRemote
  statusRemote
  deleteRemote
  restartRemote
  msg "--- deployDone ---"
  logRemote
}


function setUpEnv() {
  echo "setUpEnv"
}


function getToken() {
  msg "getToken ${HOST_DOMAIN}"
  curl ${HOST_DOMAIN}/wcapi/token.text > config/token.env
  ACCESS_TOKEN=$(<config/token.env)
  cat config/token.env
}

function main() {

  case "$runCmd" in

    "env")
      readEnv $envOpt
      ;;

    "sync")
      readEnv $envOpt
      syncRemote
      ;;

    "install")
      readEnv $envOpt
      installRemote
      ;;


    "firstRun")
      readEnv $envOpt
      syncRemote
      installRemote
      coldStart
      ;;

    "restart")
      readEnv $envOpt
      restartRemote
      ;;

    "log")
      readEnv $envOpt
      logRemote
      ;;

    "deploy")
      readEnv $envOpt
      syncRemote
      installRemote
      restartRemote
      # logRemote
      ;;

    "qd")
      readEnv $envOpt
      syncRemote
      restartRemote
      # logRemote
      ;;

    *)
      showHelp
      die "try again :D"
      ;;

  esac

}


runCmd=$1
# pass in the env
envOpt=$2

clear
main
