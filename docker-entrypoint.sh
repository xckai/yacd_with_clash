#!/bin/bash
sed -i "s|http://127.0.0.1:9090|$YACD_DEFAULT_BACKEND|" /usr/share/nginx/html/index.html


# 检查有没有计划的cron任务
crontab_list=$(crontab -l)
new_add_script="${SUB_UPDATE_CRON:-0 4 * * *} node /server/cmd.js update >/dev/null 2>&1"
result=$(echo "$crontab_list" | grep -e "node /server/cmd.js update")
# 检查当前的计划任务列表是否包含我们的脚本
if [ -n "$result" ];   then
  echo "Cron job already exists."
else
  # 如果不存在，那么添加crontab计划任务
  (crontab -l; echo "$new_add_script") | crontab -
  echo "Cron job added."
fi

exec node /server/cmd.js run
