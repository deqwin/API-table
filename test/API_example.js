/**
 * API 合并器，把各个API合并起来，构建一个总API
 */

let API = {
	'APIBlock_1': {
		'/API_1.1' : {
			method: 'GET',
			req: {},
			res:{
				"result": "OK" 
			} 
		},
		'/API_1.2' : {
			method: 'POST',
			req: {
				"page": 4,
				"count": 12
			},
			res:{
				"result": "OK",
				"list": [{
					"item_1": "00001" 
				},{
					"item_2": "00002" 
				},{
					"item_3": "00003" 
				}]
			} 
		},
	},
	'APIBlock_2': {
		'/API_2.1' : {
			method: 'GET',
			req: {},
			res:{
				"result": "error"
			} 
		},
	}
}

module.exports = API;
// export { mainAPI, structureAPI };