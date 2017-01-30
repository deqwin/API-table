/**
 * 打印API
 */

module.exports = {

	//获取支持的学校树
	//## 特殊API ## 说明，该API返回的 universityTree 所只的对象为动态属性对象，动态格式为 <省份>：<城市> ：[学校]，请看下面例子
	'/print/getUniversityTree': {
		method: 'GET',
		req: null,
		res: {
			result: 'OK',
			tree: {	//城市大学树 <城市> ：<学校> : [校区名]
				'广州': {
					'华南理工大学': ['五山校区', '大学城校区'],
					'中山大学': ['海珠校区', '大学城校区', '珠海校区']
				},
				'深圳': { '深圳大学': ['本校区','新校区'] }
			}
		}
	},

	//获得打印点列表
	'/print/getPrintPointList': {
		method: 'GET',
		req: {
			city: '广州',
			university: '华南理工大学',
			campus: '五山校区'
		},
		res: {
			result: 'OK', //
			list: [{
				printPointId: 'print00000001',
				pointType: 'ATM',
				phoneNumber: '18819477443',
				printPointName: '北三ATM',
				address: '华工北三一楼 - 工作室门口',
				message: '宅印ATM，24小时取件，方便快捷',
				imageUrl: 'images/statemock.jpg',
				takeTime: [7, 0, 22, 0],
				maxPages: 400, // TOADD
				basicPrintItem:
				{
					monoSingle: 10,
					monoDuplex: 15,
					colorfulSingle: 100,
					colorfulDuplex: 150
				},
				beginPrice: {
					prePrintStart: -1,
					distributionStart: -1
				}
			}]
		}
	},

	'/print/test': {
		method: 'POST',
		req: {
			
		},
		res: {

		}
	}







}