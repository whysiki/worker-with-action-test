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
			//如果有@botname，去掉
			const index = command.indexOf('@');
			if (index !== -1) {
				return command.substring(0, index);
			}
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

// {
// 	"update_id": 582562777,
// 	"message": {
// 	  "message_id": 2023,
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
// 		"id": 6315542418,
// 		"first_name": "jsp",
// 		"last_name": "dmx",
// 		"username": "gffxg148944637",
// 		"type": "private"
// 	  },
// 	  "date": 1725117107,
// 	  "sticker": {
// 		"width": 512,
// 		"height": 512,
// 		"emoji": "😝",
// 		"set_name": "PJSKJZ",
// 		"is_animated": false,
// 		"is_video": false,
// 		"type": "regular",
// 		"thumbnail": {
// 		  "file_id": "AAMCBQADGQEAAgfnZtMys1ZkxPWB9Xdrzh4P-5Hjq9cAAlIMAALTdlBWnJCGXrKah00BAAdtAAM1BA",
// 		  "file_unique_id": "AQADUgwAAtN2UFZy",
// 		  "file_size": 20816,
// 		  "width": 320,
// 		  "height": 320
// 		},
// 		"thumb": {
// 		  "file_id": "AAMCBQADGQEAAgfnZtMys1ZkxPWB9Xdrzh4P-5Hjq9cAAlIMAALTdlBWnJCGXrKah00BAAdtAAM1BA",
// 		  "file_unique_id": "AQADUgwAAtN2UFZy",
// 		  "file_size": 20816,
// 		  "width": 320,
// 		  "height": 320
// 		},
// 		"file_id": "CAACAgUAAxkBAAIH52bTMrNWZMT1gfV3a84eD_uR46vXAAJSDAAC03ZQVpyQhl6ymodNNQQ",
// 		"file_unique_id": "AgADUgwAAtN2UFY",
// 		"file_size": 34046
// 	  }
// 	}
//   }

// getStickerSet
// Use this method to get a sticker set. On success, a StickerSet object is returned.

// Parameter	Type	Required	Description
// name	String	Yes	Name of the sticker set

// StickerSet
// This object represents a sticker set.

// Field	Type	Description
// name	String	Sticker set name
// title	String	Sticker set title
// sticker_type	String	Type of stickers in the set, currently one of “regular”, “mask”, “custom_emoji”
// stickers	Array of Sticker	List of all set stickers
// thumbnail	PhotoSize	Optional. Sticker set thumbnail in the .WEBP, .TGS, or .WEBM format
