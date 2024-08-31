// 提取命令 string
export const extractCommand = (message) => {
	// 确保 message 和 message 存在
	if (message && message.message && message.message.entities && Array.isArray(message.message.entities)) {
		// 检查 entities 数组是否包含 bot_command 类型的实体
		const botCommandEntity = message.message.entities.find((entity) => entity.type === 'bot_command');

		if (botCommandEntity) {
			// 确保 message.text 存在并处理命令
			const text = message.message.text ? message.message.text.trim() : '';
			const command = text.startsWith('/') ? text.substring(1) : null;
			return command;
		}
	}

	// 如果不满足条件，返回 null
	return null;
};

// 提取Sticker object
export const extractSticker = (message) => {
	if (message && message.message && message.message.sticker) {
		return message.message.sticker;
	}
	return null;
};

// {
// 	"update_id": 582562749,
// 	"message": {
// 	  "message_id": 27,
// 	  "from": {
// 		"id": 6315542418,
// 		"is_bot": false,
// 		"first_name": "jsp",
// 		"last_name": "dmx",
// 		"username": "gffxg148944637",
// 		"language_code": "zh-hans",
// 		"is_premium": true
// 	  },
// 	  "chat": {
// 		"id": -1002065535396,
// 		"title": "Self.__inform",
// 		"type": "supergroup"
// 	  },
// 	  "date": 1725113174,
// 	  "text": "😞"
// 	}
//   }
