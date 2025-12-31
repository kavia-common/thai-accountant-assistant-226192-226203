#!/bin/bash
cd /home/kavia/workspace/code-generation/thai-accountant-assistant-226192-226203/accountant_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

