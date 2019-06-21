# test message out

set -x # see cmds

curl -i -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -X POST -d \
  "{ 'chatId': '5d023934bd6faa1c4e8f7bbf', 'token': '5d0220f094e51003fff1f522', 'messageType': 0, 'payload': { 'text': 'from code' } }" \
  https://api.botorange.com/xiaoju/message/send -v



    # "{'json':{'data':'here'}}" \
