# check if deployed bot is receiving messages in

# curl -i -d "param1=value1&param2=value2" http://recobot.bot-wiz.com:60001/api/orange/in

set -x

curl -i -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -X POST \
    '{ "messageId": "1674004642", \
    "chatId": "5d023965bd6faa1c4e8f8785", \
    "roomTopic": "BotOrange test 1", \
    "roomId": "18137271751@chatroom", \
    "contactName": "DC | CTO | Rikai Labs", \
    "contactId": "wxid_xet7g1sedofm12", \
    "payload": { "text": "real msg" }, \
    "type": 7, \
    "timestamp": 1560485399000, \
    "token": "5d0220f094e51003fff1f522" }' \
  http://recobot.bot-wiz.com:60001/api/bot/in/message -v





  # "{ "chatId": "5d023934bd6faa1c4e8f7bbf", "token": "5d0220f094e51003fff1f522", "messageType": 0, "payload": { "text": "from code" } }" \
