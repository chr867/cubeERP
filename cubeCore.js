let theme = false; // Default Theme : light = true;
/*********************************  OrderManagement VARIABLE   ***************************************/
let om10PrCode = ''; //om10 거래처코드
const deliveryData = []; //납품처JSON임시보관
let interval; // dm00 자동 프린트 interval 
let interval_status; // dm00 자동 프린트 interval 상태
let interval_index=0;
/*********************************   METHOD   ***************************************/

window.addEventListener('load', function(event) {
	setTheme();
	cubeSystemInit();
	catchCubeMaster();
	cubeMasterKeyCheck(cubeJsonData[0].cubeMasterVersion);
	quickSearchModification();
	getQuickSerchEvent();
	
	const photoCard = document.querySelector('#privateBoard > div.profile > div');
	photoCard.children[0].children[0].innerText = cubeJsonData[0]['employee'].employeeName;
	photoCard.children[0].children[1].innerText = cubeJsonData[0]['employee'].departmentName + ' ' + cubeJsonData[0]['employee'].levelName;
	photoCard.children[2].innerHTML = '<span class=\"time\">' + cubeJsonData[0]['employee']['accessHistoryBean'][0].accessTime + '</span> ' + '로그아웃';
});

/* 지업사 제지사 선택 */
const quickSearchModification = () => {
	if(!document.querySelector('#quickSearch > .titleZone > .title.header > .toggleBox')){
		const parent = document.getElementsByClassName('title header')[0];
		const switchButton = createToggleSwitch('제지사|지업사', 'toggle', 'switch','changePurchasePlaceCallback');
		parent.insertBefore(switchButton, parent.firstChild);
	}
	turnIsUsingToggle('om10', '#quickSearch > .titleZone > .title.header > .toggleBox');
}
/* 지업사 제지사 선택 이벤트*/
function changePurchasePlaceCallback(){
	const toggleBox = document.querySelector('#quickSearch > div.titleZone > div.title.header > div.toggleBox');
	const searchPart = document.querySelectorAll('#quickSearch .titleZone .title .searchPart');
	if(toggleBox.firstChild.checked){
		searchPart[0].style.setProperty('display', 'block');
		searchPart[0].classList.add('on');
		searchPart[1].classList.remove('on');
		searchPart[2].classList.remove('on');
		isSearchFocus[0][0] = true;
		isSearchFocus[1][0] = false;
		isSearchFocus[2][0] = false;
	}else{
		searchPart[0].style.setProperty('display', 'none');
		searchPart[0].classList.remove('on');
		searchPart[1].classList.remove('on');
		searchPart[2].classList.add('on');
		isSearchFocus[0][0] = false;
		isSearchFocus[1][0] = false;
		isSearchFocus[2][0] = true;
	}
	document.getElementsByClassName('wordBox')[0].value = '';
	document.getElementsByClassName('wordBox')[0].focus();
}

/* 종이방향 선택 이벤트 */
function changeDirectionCallback(){
	const toggleBox = document.querySelector('#inventorySearchCondition > div:nth-child(2) > div')
	const searchPart = document.getElementsByClassName('searchPart line_2');
	const [width, height] = [searchPart[0], searchPart[1]];
	if(toggleBox.firstChild.checked){
		if(parseInt(width?.value) < parseInt(height?.value)){
			[width.value, height.value] = [height.value, width.value];
		}
	}else{
		if(parseInt(width?.value) > parseInt(height?.value)){
			[width.value, height.value] = [height.value, width.value];
		}
	}
	document.querySelector('#inventorySearchCondition > div:nth-child(2) > input.searchPart.btn').click();
}

const cubeSystemInit = () => {	makeCube(); }

const testStock = () => {
	const formData = new FormData();
	formData.append('employeeCode', cubeJsonData[0].employee['employeeCode']);
	fetch('/STOCKINIT', 
		{	method: 'POST',
			headers: getJsonWebTokenUsingHeader(),
			body: formData
		})
		.then(res => {return res.json()})
		.then(result => {
			let msg = '';
			result[1].forEach(resultMsg=>{
				if(resultMsg.split(' ')[1] != 1){
					msg += (resultMsg.split(' ')[1] == 0)
						?`${resultMsg.split(' ')[0]} 로그인,`
						:`${resultMsg.split(' ')[0]} 사이트 접속,`
				}
			})
			msg = msg.slice(0, msg.length-1);
			if(msg.length != 0)
				messageBoardCall(`1:${msg}:실패:확인`);
		})
		.catch(error => {
			console.log(error);
		})
}

/***********************************************************************
 *  void setTheme  테마지정
 ***********************************************************************/
const setTheme = () => {
	document.documentElement.className = (theme = !theme) ? 'light' : 'dark';
};

/***********************************************************************
 *  TEST DATA : Menu
 *  Scope: Global, TYPE : Array
 ***********************************************************************/
const menuInfo = [
	[
		['resources/images/DashBoard', '대시보드', 'Personal Dash-Board'],
		[
			'대시보드',
			[
				'1/1/4/4',  '1/4/4/7', 
				'4/1/7/5',  '4/5/11/7', 
				'7/1/11/4', '7/4/11/5'
			], 
			'ds10', ['resources/js/dashBoard.js']
		],
		[
			'전자결재', 
			[
				'1/1/2/2', '1/2/2/3', '1/3/2/4', '1/4/2/5', '1/5/2/6', '1/6/2/7',
				'2/1/3/2', '2/2/3/3', '2/3/3/4', '2/4/3/5', '2/5/3/6', '2/6/3/7',
				'3/1/4/2', '3/2/4/3', '3/3/4/4', '3/4/4/5', '3/5/4/6', '3/6/4/7',
				'4/1/5/2', '4/2/5/3', '4/3/5/4', '4/4/5/5', '4/5/5/6', '4/6/5/7',
				'5/1/6/2', '5/2/6/3', '5/3/6/4', '5/4/6/5', '5/5/6/6', '5/6/6/7',
				'6/1/7/2', '6/2/7/3', '6/3/7/4', '6/4/7/5', '6/5/7/6', '6/6/7/7',
				'7/1/8/2', '7/2/8/3', '7/3/8/4', '7/4/8/5', '7/5/8/6', '7/6/8/7',
				'8/1/9/2', '8/2/9/3', '8/3/9/4', '8/4/9/5', '8/5/9/6', '8/6/9/7',
				'9/1/10/2', '9/2/10/3', '9/3/10/4', '9/4/10/5', '9/5/10/6', '9/6/10/7',
				'10/1/11/2', '10/2/11/3', '10/3/11/4', '10/4/11/5', '10/5/11/6', '10/6/11/7'
			],
			'ds20'
		],
		[
			'목표관리',
			[
				'1/1/3/4', '1/4/3/7',
				'3/1/5/4', '3/4/5/7',
				'5/1/8/4', '5/4/8/6', '5/6/8/7',
				'8/1/11/4', '8/4/11/6','8/6/11/7'
			],
			'ds30'
		],
		[
			'경영정보',
			[],
			'ds40'
		],
		[
			'기업심사',
			[
				'2/1/5/3', '5/1/9/3',
				'1/3/4/5', '1/5/4/7', '4/3/7/5', '4/5/7/7', '7/3/10/5', '7/5/10/7',
				'1/1/2/3', '10/3/11/7', '9/1/11/3'
//				'5/3/7/5', '5/5/7/7', '7/3/9/5', '7/5/9/7', '9/3/11/5', '9/5/11/7'
			],
			'ds50', ['resources/js/ds50.js']
		]
	],
	[
		['resources/images/Order', '주문관리', 'Order Management'],
		[
			'주문서', 
			[
				'1/1/3/3', '1/5/6/5','1/6/6/7',
				'3/1/11/5','1/3/3/5',
				'6/5/11/7'
			],
			'om10', ['resources/js/orderManagement.js']
		],
		[
			'거래처 출력물', 
			[
				'1/1/11/4',
				'1/4/4/6',
				'3/6/4/7',
				'1/6/3/7',
				'4/4/11/7'
			], 
			'om20', ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.0/html2canvas.min.js','resources/js/cubePrintManager.js','resources/js/om20.js']
		],
		[
			'클레임', 
			[
				'1/1/2/4','2/1/8/4','8/1/11/4',
				'1/4/5/7','5/4/11/7' 
			], 
			'om30', ['resources/js/om30.js']
		],
		[
			'주문현황', 
			[
				'1/1/2/5','2/1/8/7','8/1/11/7',
				'1/5/2/7','2/6/8/7'
			],
			'om40', ['resources/js/om40.js']
		],
		[
			'발주현황', 
			[
				'1/1/2/3','2/1/8/6','8/1/11/5',
				'1/5/2/7','2/6/8/7'
			],
			'om70', ['resources/js/om70.js']
		],
		[
			'매출현황', 
			[
				'1/1/2/3','2/1/8/5','8/1/11/7','1/3/2/4',
				'1/4/2/7','2/5/8/7'
			], 
			'om50', ['resources/js/om50.js']
		]
	],
	[
		['resources/images/Distribute', '물류관리', 'Distribute Management'],
		[
			'출고관리',
			[
				'1/1/5/5', '1/5/3/6', '3/5/11/7','5/1/11/5','1/6/3/7'
			],
			'dm00', ['resources/js/cubePrintManager.js','resources/js/releaseManagement.js']
		],
		[
			'자사재고현황',
			[
				'1/1/7/7',
				'7/1/11/2','7/2/11/3'
			], 
			'dm10', ['resources/js/dm10.js']
		],
		[
			'타사재고현황',
			[
				'1/1/7/4',
				'7/1/9/3'
			], 
			'dm60', ['resources/js/dm60.js']
		],
		[
			'입고현황', 
			[
				'1/1/2/3','2/1/8/4','8/1/11/4'
			],
			'dm20', ['resources/js/dm20.js']
		],
		[
			'출고현황', 
			[
				'1/1/2/3','2/1/8/7','8/1/11/7','1/3/2/7'
			], 
			'om60', ['resources/js/om60.js']
		],
		 [
		 	'운송비현황', 	
		 	[
		 		'1/1/2/3','1/3/2/7','2/1/11/7'
		 	], 
		 	'dm30', ['resources/js/cubePrintManager.js','resources/js/dm30.js']
		 ],
		[
			'이관현황', 	
			[
				'1/1/2/3','2/1/11/7'
			],
			'dm40', ['resources/js/dm40.js']
		],
		[
			'반품현황',
			[
				'1/1/2/3','2/1/11/7'
			],
			'dm50', ['resources/js/dm50.js']
		],
		[
			'파렛트 수불', 
			[
				'1/1/2/3', '2/1/11/3', '1/3/8/7', '8/3/11/7'
			], 
			'dm70', ['resources/js/dm70.js']
		],
	],
	[
		['resources/images/Purchase', '생산발주', 'Production Purchase'],
		[
			'의뢰', 
			[
				'1/1/6/4', '1/4/6/5', '5/5/11/7',
				'6/1/11/3', '6/3/11/5', '1/5/5/7',
			], 
			'mo30', ['resources/js/productionPurchase.js']
		],
		[
			'생산', 
			[
				'1/3/2/7', '1/1/3/3',
				'2/3/5/4', '2/4/5/7', '5/3/7/7', '3/1/7/3',
				'7/4/11/7', '7/3/9/4'
			], 
			'mo10', ['resources/js/mo10.js']
		],
		[
			'발주', 
			[
				'1/1/3/2', '1/2/3/3', '1/3/3/4', '1/4/3/6', '1/6/3/7',
				'3/1/5/3', '3/3/11/7',
				'5/1/11/3'
			], 
			'mo20', ['resources/js/mo20.js']
		],
		[
			'매입 반품', 
			[
				'1/1/3/3', '2/1/11/3',
				'1/3/8/7', '8/3/11/5'
			], 
			'mo40', ['resources/js/mo40.js']
		],
		[
			'매출 반품', 
			[
				'1/1/2/4', '2/1/11/4',
				'1/4/8/7', '8/4/11/6','8/6/11/7'
			], 
			'mo50', ['resources/js/mo50.js']
		]
	],
	[
		['resources/images/Settlement', '마감정산', 'Deadline Management'],
		[
			'매입 마감', 
			[
				'1/1/3/2', '1/2/3/3',
				'3/1/7/6', '1/3/3/4',
				'7/1/11/6', '1/6/11/7', '1/4/3/6'
			], 
			'cl10', ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.14.3/xlsx.full.min.js', 'resources/js/cl10.js']
		],
		[
			'매출 마감',
			[
				'1/1/3/3', '3/1/7/3', '7/1/10/3',
				'1/3/11/7',
				'10/1/11/3'
			], 
			'cl20', ['resources/js/cl20.js']
		],
		[
			'주문 일일 마감',
			[
				'1/1/2/4', '1/4/2/6',
				'2/1/11/7',
				'1/6/2/7'
			], 
			'cl30', ['resources/js/cl30.js']
		],
		[
			'거래처 수불대장', 
			[
				'1/1/2/7', '2/1/11/7'
			], 
			'cl40', ['resources/js/cl40.js']
		],
		[
			'매입 매출 수불대장', 
			[
				'1/1/2/7', '2/1/11/7'
			], 
			'cl50', ['resources/js/cl50.js']
		],
	],
	[
		['resources/images/Account', '경영회계', 'Accounts Management'],
		[
			'수금 현황',
			[
				'1/1/3/3', '3/1/7/3', '1/3/7/5','1/5/7/7',
				'7/1/11/5', '7/5/11/7'
			], 
			'am10', ['resources/js/am10.js']
		]
	],
	[
		['resources/images/Basic', '정보관리', 'Default Infomation'],
		[
			'거래처 관리',
			[
				'1/1/3/4','3/1/8/4','8/1/11/2','8/2/11/3','8/3/11/4',
				'1/4/4/5','4/4/7/5','7/4/8/5','8/4/11/5',
				'2/5/11/7','1/5/2/7'
			],
			'bi10', ['resources/js/bi10.js']
		],
		[
			'상품', 	
			[
				'1/1/7/2','1/2/6/5','6/2/7/5',
				'1/5/7/6'
			], 
			'bi20', ['resources/js/bi20.js']
		],
		[
			'조직', 
			[
				'1/1/3/2', '1/2/3/3', '1/3/3/5',
				'3/1/11/3', '3/3/11/5', '3/5/11/7'
			], 
			'bi30'
		],
		[
			'영업 품의', 
			[
				'1/1/4/4','4/1/7/3','4/3/7/4','7/1/9/2','9/1/11/2','7/2/8/4','8/2/11/4',
				'1/4/2/6','1/6/2/7','2/4/3/6','3/4/6/6','2/6/4/7','4/6/6/7' 
			], 
			'bi40', ['resources/js/bi40.js']
		]
	]
];

/* QuickSearch Columns Info */
const quickSearchcolumns = [
	[
		['거래처', 'partnerName', '30%', 'left'], ['대표자', 'partnerCeo', '15%', 'center'], 
		['사업자번호', 'partnerCode', '20%', 'center'], ['대표전화', 'partnerPhone', '25%', 'center'],
		['거래상태', 'partnerStateName', '10%', 'center'],
		[['특이사항', 'pnNotice', '100%', 'center']],
		['successPartner']
	],
	[
		['거래처', 'partnerName', '30%', 'left'], ['대표자', 'partnerCeo', '15%', 'center'], 
		['사업자번호', 'partnerCode', '20%', 'center'], ['대표전화', 'partnerPhone', '25%', 'center'],
		['거래상태', 'partnerStateName', '10%', 'center'],
		[['특이사항', 'pnNotice', '100%', 'center']],
		['successPartner']
	],
	[
		['지종', 'caName', '15%', 'center'], ['제지사', 'paperMakerName', '25%', 'left'],
		['상품명', 'originalName', '35%', 'left'], ['FSC', 'fsc', '5%', 'center'], 
		['평량', 'weight', '5%', 'right'],
		['상태', 'stateName', '15%', 'center',],
		[['원지코드', 'originalCode', '100%', 'center']],
		['successGoods']
	]
];

/***********************************************************************
 *  void makeCube  CUBE 생성
 ***********************************************************************/
let cubeDisplay = false;
function makeCube(){
	const className = ['face front', 'face top', 'face rightside',  'face leftside', 'face bottom', 'face back' ];
	/* Cube Creation */
	const cubeBox = document.getElementsByClassName('cubeBox')[0];
	const cube = createDIV(null, 'cube', 'callDrawer()');

	className.forEach( className => {
		cube.appendChild(createDIV(null, className, null));
	});
	cubeBox.appendChild(cube);
}

/***********************************************************************
 *  void callDrawer  서랍메뉴호출
 * 	param : 
 *  return :
 ***********************************************************************/
function callDrawer(){
	const cube = document.querySelector('.cubeBox .cube');
	const privateBoard = document.getElementById('privateBoard');
	const photoCard = document.querySelector('#privateBoard > div.profile > div');
	photoCard.style.setProperty('display', !cubeDisplay? 'flex' : 'none');
	privateBoard.style.setProperty('top', !cubeDisplay?'calc(100vh - var(--drawer-height) - 225px)': 'calc(100vh - 25px)');
	privateBoard.style.setProperty('height', !cubeDisplay? '250px':'0px')
	privateBoard.style.setProperty('border-width', !cubeDisplay? '3px':'0px');
	privateBoard.style.setProperty('transition', 'all .7s ease-in-out');

	if(cubeDisplay) {
		privateBoard.querySelector('.function .sub').style.setProperty('display', 'none');
		privateBoard.querySelector('.function .main').innerText = '';
		privateBoard.querySelector('.function .sub').innerText = '';
		cube.style.removeProperty('animation-duration');
	}
	else{	
		let menuBox = null, en = null, ko = null;
		for(let menuIdx=0; menuIdx<menuInfo.length+1; menuIdx++){

			menuBox = createDIV(null, 'menuBox', null);
			en = createDIV(null, 'en', null);
			en.innerText = (menuIdx != menuInfo.length)? menuInfo[menuIdx][0][2] : 'BxT Groupware';

			ko = createDIV(null, 'ko', null);
			ko.innerText = (menuIdx != menuInfo.length)? menuInfo[menuIdx][0][1] : '그룹웨어';

			menuBox.appendChild(en);
			menuBox.appendChild(ko);
			menuBox.setAttribute('class', 'function main menuBox');
			menuBox.addEventListener('click', ()=>{
				if(menuIdx != menuInfo.length) callSubMenu(menuIdx);
			});
			privateBoard.children[1].children[0].appendChild(menuBox);
		}

		cube.style.setProperty('animation-duration', '2s');
	}

	cubeDisplay = !cubeDisplay;
}


/***********************************************************************
 *  void callSubMenu  서브메뉴호출
 *  return :
 ***********************************************************************/
const callSubMenu = (menuIdx) => {
	const sub = document.querySelector('#privateBoard .function .sub');
	sub.style.setProperty('display', 'flex');

	if(sub.hasChildNodes) sub.innerText = '';
	let menuTag = null;

	for(let idx = 1; idx < menuInfo[menuIdx].length; idx++){
		menuTag = createDIV(null, 'menuTag', null);
		menuTag.innerText = menuInfo[menuIdx][idx][0];
		/* subMenu_click function */
		menuTag.addEventListener('click', ()=>{
			/* 기 생성여부 판단 */
			if(document.querySelector("#popupDialog")!=null){
				document.querySelector("#popupDialog").remove();
			}
			let canvasIdx = findCanvas(menuInfo[menuIdx][idx][2]);
			if( canvasIdx == -1){
				/* 기 생성된 개체가 없을 경우 : 1. WORK BOARD 생성  2. Recent Tag 생성 */
				canvasIdx = createWorkBoardCtl(menuInfo[menuIdx][idx]);
				openCanvas(canvasIdx);
				displayCanvasList(canvasIdx);
				
                /* 해당 WorkSpace Controller 호출 */
				finalExecuteFunc = menuInfo[menuIdx][idx][2]+'Init';
				const scriptSource = menuInfo[menuIdx][idx][3];
								
				for(let idx=0; idx < scriptSource.length; idx++){
					loadSriptSource(idx == scriptSource.length-1? finalExecuteFunc: null, canvasIdx, scriptSource[idx]);					
				}
			}else{
				openCanvas(canvasIdx);
				displayCanvasList(canvasIdx);
			}
			sub.style.setProperty('display', 'none');
			callDrawer();
		});
		sub.appendChild(menuTag);
	}
};

const canvasBox = []; // 생성되는 canvas 저장
/***********************************************************************
 *  int findCanvas    SubMenu에 대한 Canvas가 이미 존재한다면 CanvasBox
 *                    의 해당 index 리턴 없을 경우 false 리턴
 *  param : string canvasId
 ***********************************************************************/
const findCanvas = (canvasId) => {
	let isCanvas = -1;
	for (idx = 0; idx < canvasBox.length; idx++) {
		if (canvasBox[idx].id == canvasId) {
			isCanvas = idx;
			break;
		}
	}

	return isCanvas;
};

/***********************************************************************
 *  void createCanvas   SubMenu에 대한 Canvas생성
 *  param : [] canvasSpec
 ***********************************************************************/
const createWorkBoardCtl = (canvasSpec) => {
	const canvas = document.getElementById('cubeCanvas');

	/* Work Space Creation */
	const workSpace = createDIV('', 'workSpace', '');
	workSpace.setAttribute('id', canvasSpec[2]);
	workSpace.setAttribute('data-name', canvasSpec[0]);  

	/* Work Board 생성 요청 --> workSpace.appendChild */
	const boardSpec = canvasSpec[1];
	if (boardSpec != null && boardSpec.length > 0) {
		const board = [];
		for (let boardIdx = 0; boardIdx < boardSpec.length; boardIdx++) {
			const workBoard = createBoard(['workBoard', boardSpec[boardIdx]]);
			workBoard.style.setProperty('visibility', 'hidden');
            
			/* WorkSpace에 추가 */
			workSpace.appendChild(workBoard);
		}
	}
	canvasBox.push(workSpace);
	canvas.appendChild(canvasBox[canvasBox.length-1]);
	return canvasBox.length-1;
};

let currentCanvasIdx = -1; // canvasBoxIdx의 현재 canvasIdx 
/***********************************************************************
 *  void openCanvas   canvasBox리스트 중 param과 일치하는 canvas는
 *                    보여주고 나머지는 감추기
 *  param : string canvasId
 ***********************************************************************/
const openCanvas = (canvasIdx) => {
	currentCanvasIdx = parseInt(canvasIdx) + 2;
	if (canvasIdx != -1) {
		for (idx = 0; idx < canvasBox.length; idx++) {
			canvasBox[idx].style.setProperty('display', idx == canvasIdx ? 'grid' : 'none');
		}
	} else {
		canvasBox.pop();
		// setMouseEvent 수정할 것!
	}
};

/***********************************************************************
 *  void displayCanvasList   canvasBox리스트를 recent 영역에 출력
 *  param :
 ***********************************************************************/
const displayCanvasList = (canvasIdx) => {
	const recent = document.getElementsByClassName('erp')[0];
	recent.innerText = '';
	if (canvasIdx > -1) {
		for (idx = 0; idx < canvasBox.length; idx++) {
			const pannel = createDIV( null, 'pannel', null);
			pannel.setAttribute('data-idx', idx);
			pannel.style.setProperty(
					'background-color',
					idx == canvasIdx ? 'var(--color-2)' : 'var(--color-6)'
			);

			const canvasTag = createDIV(null, 'canvasTag', null);
			canvasTag.innerText = canvasBox[idx].dataset['name'];
			canvasTag.addEventListener('click', () => {
				openCanvas(pannel.dataset['idx']);
				displayCanvasList(pannel.dataset['idx']);
				if(document.querySelector("#popupDialog")!=null){
					document.querySelector("#popupDialog").remove();
				}
			});

			const closingBtn = createDIV(null, 'closingBtn', null);
			closingBtn.innerText = 'X';
			closingBtn.addEventListener('click', () => {
				let currentIdx = pannel.dataset['idx']; // 제거하고자 하는 canvas의 index 추출
				const canvasLength = canvasBox.length; // js영역의 canvas 갯수 추출				
				
				/* 주문서인 경우 Toggle 상태 변경*/
				canvasBox.filter(canvas => {
					if(canvas.id == 'om10' 
						&& document.querySelector('#quickSearch > div.titleZone > div.title.header > div.toggleBox')) callQuickSearch(true);
				});
				
				/* canvas 제거 후 focus Canvas Index 계산 */
				let newSelectedIdx = -1;
				if (currentIdx != canvasIdx)
					newSelectedIdx = currentIdx > canvasIdx ? canvasIdx : canvasIdx - 1;
					else if (canvasLength > 1)
						newSelectedIdx = canvasIdx < canvasLength - 1 ? canvasIdx : canvasIdx - 1;

				/* js의 참조 영역과 Html영역의 canvas 제거 */
				canvasBox.splice(currentIdx, 1);
				removeCanvas(currentIdx);			
				
				/* re-rendering */
				openCanvas(newSelectedIdx);
				displayCanvasList(newSelectedIdx);
			});
			pannel.appendChild(canvasTag);
			pannel.appendChild(closingBtn);

			recent.appendChild(pannel);
		}
	} else {
		currentCanvasIdx = -1;
		/* MessageBox 호출 : 테스트 */
		messageBoardCall('0:작업화면 초기화:로딩되었던 모든 작업 화면이 사라집니다.:확인');
	}
};

/***********************************************************************
 *  void removeCanvas        canvasBox리스트를 특정 canvas 제거
 *  param : int canvasIdx    제거하고자 하는 canvas의 index
 ***********************************************************************/
const removeCanvas = (removeIdx) => {
	document.getElementsByClassName('workSpace')[removeIdx].remove();
	cubeJsonData[parseInt(removeIdx) + 2] = null;
};

/***********************************************************************
 *  HTMLObject createBoard   SubMenu의 선택 모드
 *  param : Dynamic Array
 ***********************************************************************/
const createBoard = (objInfo) => {
	/* WolrkBoard */
	const board = document.createElement('div');
	board.setAttribute('class', objInfo[0]);
	board.style.setProperty('grid-area', objInfo[1]);

	/* Badge */
	const badge = document.createElement('div');
	badge.setAttribute('class', 'badge');
	/* Content */
	const content = document.createElement('div');
	content.setAttribute('class', 'content');
	/* Panel */
	const panel = document.createElement('div');
	panel.setAttribute('class', 'panel');
	content.appendChild(panel);

	board.appendChild(badge);
	board.appendChild(content);

	return board;
};

/***********************************************************************
 *  MessageBoard Call
 ***********************************************************************/
const messageBoardCall = (text) => {
	const messageInfo = text.split(':');
	const messageBg = createDIV(null, 'bgLayer', null);
	const messageBoard = createDIV(null, 'messageBoard', null);
	messageBoard.style.setProperty( 'background-color', messageInfo[0] == 0 ? 
			'var(--color-6)' : messageInfo[0] == 1 ? 'var(--color-4)' : 'var(--color-2)' );
	const message = [
		createDIV(null, 'messageTitle', null),
		createDIV(null, 'messageBody', null),
		createDIV(null, 'messageBtn', null),
		];

	message.forEach((obj, idx) => {
		obj.innerText = messageInfo[idx + 1];
		messageBoard.appendChild(obj);
		if(idx == 2) obj.addEventListener('click', ()=>{
			messageBg.remove();
		});
	});
	messageBg.appendChild(messageBoard);
	document.body.appendChild(messageBg);
};

/** HTML Object Selector
 * @param[0~] {String} 선택자 query 
 * @param[-1] {Boolean} + All 여부 
 */
function selectHTML(...param){
	const currentBoard = canvasBox[parseInt(currentCanvasIdx)-2];
	let query = '#' + currentBoard.id + ' ';
	let selector = document.querySelector('' +query + '');
	
	if(param.length > 1){
		for(let i=0; i<param.length-1; i++){
			if(param[i] && i != param.length-1){query += param[i] + ' '} 
			else(query += param[i]);
		}
		selector = !param[-1]
		? document.querySelectorAll('' + query + '')
		: document.querySelector(''+ query + '');
	}else if(param.length == 1) selector = document.querySelector('' + query + param[0] + '');
		
	return selector;
}

/* JsonData를 저장하는 배열
 * [0] >> 로그인 정보
 * [1] >> QuickSearch datas
 * [2~] >> canvas에서 사용 할 jsonData : currentCanvasIdx(canvasBoxIdx + 2)
*/
let cubeJsonData = [];
cubeJsonData[1] = [];

/**  Server로부터의 데이터 전달이 필요한 SubMenu CallBack
 * 	+param[0] >> RestData || Error Message
 * 		 +[1][0][0] >> RestData를 표현 할 Target Object
 *       +[1][0][1] >> RestData 데이터 리스트 중 접근할 리스트 이름
 *       +[1][0][2] >> RestData 정렬 방식
 *       +[1][1]    >> Columns Infomation
 *                  >> Last Index       >> Event 발생시 전달할 값 
 *                  >> Last Index -1    >> 펼침으로 보여줄 RestData
 */
function cubeCallBack(...param){
    cubeJsonData[currentCanvasIdx] = param[0];
    const currentJsonData = param[1][0][1];
    const workBoard = param[1][0][0];
    const alignType = param[1][0][2];
    const columnsInfo = param[1][1];
    /* JSON Data Alignment */
    sortJSON(cubeJsonData[currentCanvasIdx][currentJsonData], columnsInfo[0][1], alignType);
    /* Grid Creation */
    makeCubeGridInWorkBoard(workBoard, columnsInfo , currentJsonData, alignType);  
}

/* WorkBoard의 panel에 Grid를 생성
 * param[0] >> Grid를 생성할 보드 : HTMLNode
 * param[1] >> columnsInfo : Array
 * param[2] >> JsonData Key : String
 * param[3] >> 정렬 방식 : Boolean
 * param[4] >> 모듈에서 호출 했는지 여부 : Boolean
 */
function makeCubeGridInWorkBoard(...param) {
	/* panel == backBoard  초기화 */
	const backBoard = (param[5])? param[0]: param[0].children[1].children[0];
	backBoard.innerText = '';    
	
	const gridRecords = [];
	/* Grid Header */
	if(param[5]) gridRecords.push(makeGridHeader(param[0], param[1], param[2], param[3], param[4], param[5]));
	else gridRecords.push(makeGridHeader(param[0], param[1], param[2], param[3], param[4]));
	
	/* Grid Record */
	makeGridRecord(gridRecords, param[1], param[2], param[4]);
    /* Grid PageInfo */
    //makeGridPageInfo(gridRecords, currentJsonData ? cubeJsonData[currentJsonData].length : cubeJsonData.length);

	for(recordIdx=0; recordIdx<gridRecords.length; recordIdx++){
		backBoard.appendChild(gridRecords[recordIdx]);
	}
	
	if(!param[5]) param[0].children[1].appendChild(backBoard);
};

/* Grid Header 생성
 * param[0] >> Header를 생성할 보드 : HTMLNode
 * param[1] >> 컬럼 정보 : Array
 * param[2] >> JsonData Key : String
 * param[3] >> 정렬 방식 : Boolean
 * param[4] >> 모듈에서 호출 했는지 여부 : Boolean
*/
function makeGridHeader(...param){
	const header = document.createElement('div');
	header.setAttribute('class', 'header');

	for(let colIdx = 0; colIdx < param[1].length-2; colIdx++){
		const col = document.createElement('div');
		col.setAttribute('class', 'headerCol');
		
        col.addEventListener('click', () => {
            param[3] = !param[3];
           
            /* JSON Data Alignment */
			param[4]? 
			(	sortJSON(cubeJsonData[1][param[2]], param[1][colIdx][1], param[3]),
				param[5]? makeCubeGridInWorkBoard(param[0], param[1], param[2], param[3], param[4], param[5]):
						  makeCubeGridInWorkBoard(param[0], param[1], param[2], param[3], param[4])
			) : 
			(	sortJSON(cubeJsonData[currentCanvasIdx][param[2]], param[1][colIdx][1], param[3]),
					param[5]? makeCubeGridInWorkBoard(param[0], param[1], param[2], param[3], param[4], param[5]):
						  	  makeCubeGridInWorkBoard(param[0], param[1], param[2], param[3], param[4])
			);
        });
                
		col.innerText = param[1][colIdx][0];
		col.style.setProperty('width', param[1][colIdx][2]);
		header.appendChild(col);
	}
	return header;
};



const selectedRecord = [];
/* Grid Row 생성
 * param[0] >> Record를 담을 배열 : Array
 * param[1] >> 컬럼 정보 : Array
 * param[2] >> JsonData Key : String
 * param[3] >> 모듈에서 호출 했는지 여부 : Boolean
*/
function makeGridRecord(...param){
	const records = document.createElement('div');
	records.setAttribute('class', 'records');
	
    const dataList = param[3]? param[2]? cubeJsonData[1][param[2]] : cubeJsonData[1] : param[2]? cubeJsonData[currentCanvasIdx][param[2]] : cubeJsonData[currentCanvasIdx]     
	for(let recordIdx=0; recordIdx<dataList.length; recordIdx++){
		const row = document.createElement('div');
		row.setAttribute('class', 'row');
		if(param[1][param[1].length-1] != 'undefined' && 
            param[1][param[1].length-1] != null) {
			row.addEventListener('click', ()=>{
                let eventFunc = param[1][param[1].length-1][0];
							
                window[eventFunc](dataList[recordIdx], event.target);
			});
		}
		let keys = Object.keys(
				param[3] ? param[2]
				? cubeJsonData[1][param[2]][recordIdx]
				: cubeJsonData[1][recordIdx]
				: param[2]
				? cubeJsonData[currentCanvasIdx][param[2]][recordIdx]
				: cubeJsonData[currentCanvasIdx][recordIdx]
		);

		for(let colIdx=0; colIdx<param[1].length-2; colIdx++){
			for(keyIdx=0; keyIdx<keys.length; keyIdx++){
				if(param[1][colIdx][1] == keys[keyIdx]){
					const colItem = document.createElement('div');
					colItem.setAttribute('class', 'col');
					colItem.style.setProperty('width', param[1][colIdx][2]);
					colItem.style.setProperty('text-align', param[1][colIdx][3]);
					colItem.innerText = param[3] ? param[2] 
							? cubeJsonData[1][param[2]][recordIdx][keys[keyIdx]] 
						    : cubeJsonData[1][recordIdx][keys[keyIdx]]
							: param[2] 
							? cubeJsonData[currentCanvasIdx][param[2]][recordIdx][keys[keyIdx]] 
						    : cubeJsonData[currentCanvasIdx][recordIdx][keys[keyIdx]];
					if(keys[keyIdx].includes('Phone') && colItem.innerText != 'NO-DATA'){
						colItem.innerText = convertPhoneNumber(colItem.innerText);
					}
					row.appendChild(colItem);
					break;
				}
			}
		}
		records.appendChild(row);
	}
	param[0].push(records);
}

/* 전화번호 변경 */
function convertPhoneNumber(data){

	const selectString = data.substring(0,2);
	let res = null;

	if(selectString == '00'){
		res = data.substring(1,11);
	}else if(selectString == '10' || selectString == '70'){
		res = '0' + data;
	}else{
		res = data;
	}
	return res;
}

const makeGridPageInfo = (...paging) => {
    const pageInfo = document.createElement('div');
	pageInfo.setAttribute('class', 'pageInfo');

    const totalRecords = document.createElement('div');
    totalRecords.setAttribute('class', 'totalRecords');
    const selectPage = document.createElement('div');
    selectPage.setAttribute('class', 'selectPage');
    const signature = document.createElement('div');
    signature.setAttribute('class', 'signature');
    
    totalRecords.innerText = paging[1] != null? 'Total ' + paging[1] : '';
    selectPage.innerText = paging[2] != null? paging[2] : '';
    signature.innerText = 'No.1 SINSEUNG Inc. with CUBE';

    pageInfo.appendChild(totalRecords);
    pageInfo.appendChild(selectPage);
    pageInfo.appendChild(signature);

    paging[0].push(pageInfo);
};

const makeCubeGridInPopUpBoard = (workBoard, columns) => {
	
	const backBoard = workBoard.children[0];
	const gridRecords = [];

	/* Grid Header */
	gridRecords.push(makeGridHeader(columns));

	/* Grid Record */
	makeGridRecord(gridRecords, columns, 'selectPartnerList', isEvent);

	for(recordIdx=0; recordIdx<gridRecords.length; recordIdx++){
		backBoard.appendChild(gridRecords[recordIdx]);
	}

	return backBoard;
};

/**
 * JSON Data의 정렬
 * param {*} jsonList  :: JSON Data 
 * param {*} key       :: 정렬 기준 키
 * param {*} type      :: true - asc   false - desc
 * returns 
 */
const sortJSON = (...param)  => {	  
	return param[0].sort((a, b) => {
		let x = a[param[1]];
	    let y = b[param[1]];
	    
	    if (!param[2]) return x > y ? -1 : x < y ? 1 : 0;
	    else return x < y ? -1 : x > y ? 1 : 0;
	});
};


/** 보드 활성화 / 비활성화
 * param[0] >> 활성/비활성화 시킬 WorkBoard : HTML Object
 *         [1] >> 활성/비활성화 여부 : boolean
 * 		   [2] >> Badge에 적용할 title : String
 *		   [3] >> Badge에 적용할 color : String
 *		   [4] >> Refresh 로고 클릭 시 Function : String
 */
function workBoardActivation(...param){
	param[0].style.setProperty('visibility', param[1]? 'visible' : 'hidden');
	param[0].children[0].innerText = param[2] == null? '' : param[2];
    param[0].children[0].style.setProperty('background-color', param[3]);

	if(param[4]){
		const badge = param[0].children[0];
    
		const refreshDiv = createDIV();
		badge.prepend(refreshDiv);
		refreshDiv.style.setProperty('width', '100%');
		refreshDiv.style.setProperty('height', '20px');
		refreshDiv.style.setProperty('cursor', 'pointer');
		
		const refreshImg = document.createElement('img');
		refreshDiv.appendChild(refreshImg);
		refreshImg.src = 'resources/images/refresh.png';
		refreshDiv.addEventListener('click', ()=> window[param[4]]() );
	}
}

/* 전자결재 클릭 시
 * */
let approvalStatus = false;
function approvalPopup(...param){
	approvalStatus = !approvalStatus;
	let approvalBg = null;
	let approval = document.getElementById('approvalPopup');

	if(approvalStatus){
		approvalBg = createDIV(null, 'bgLayer', null);
		approval.style.setProperty('display', 'flex');
		approvalBg.appendChild(approval);
		document.body.appendChild(approvalBg);

		getEmployees();
	}else{
		/* 검색구분버튼 선택 해제 */
		isSearchFocus[0][0] = false; isSearchFocus[1][0] = false;
		approvalBg = document.getElementsByClassName('bgLayer')[0];
		approval.style.setProperty('display', 'none');
		document.body.appendChild(approval);
		approvalBg.remove();
	}
}

/* 전자결재 임직원 목록
 *
 */
function getEmployees(...param){
	const popBoard = document.getElementsByClassName('section')[0];

	const arguments = [];
	arguments.push(popBoard);
	arguments.push('proposalEmployeesList');
	arguments.push(true); /* record Align >> true : asc   false: desc */

	const columns = [
		['부서', 'deName', '20%', 'center'],
		['성명', 'emName', '35%', 'left'],
		['직급', 'wiName', '15%', 'center'],
		[	[]],[]
		];

	serverCallByFetchAfterAuth('', 'PROPOSALEMPLOYEESLIST', 'post', 'cubeCallBack', [arguments, columns]);
}

/* QuickSearch */
let quickSearchStatus = false;
function callQuickSearch(...param){
	/* QuickSearch 활성여부 상태 변경 및 ToggleBox 상태 변경 */
	if(!param[0]){
		quickSearchStatus = !quickSearchStatus;
		quickSearchModification();

		let quickSearchBg = null;
		let quickSearch = document.getElementById('quickSearch');

		if(quickSearchStatus){
			/* 자동완성 데이터 호출 */
			cubeJsonData[1]['quickSearch']=[cubeJsonData[0].cubeMasterKey.cubeMasterPR, cubeJsonData[0].cubeMasterKey.cubeMasterPR, cubeJsonData[0].cubeMasterKey.cubeMasterOG];
			testStock();
			/* JSON Data Alignment */
			sortJSON(cubeJsonData[1]['quickSearch'][0], quickSearchcolumns[0][1], true);
			sortJSON(cubeJsonData[1]['quickSearch'][1], quickSearchcolumns[0][1], true);
			sortJSON(cubeJsonData[1]['quickSearch'][2], quickSearchcolumns[1][1], true);

			quickSearchBg = createDIV(null, 'bgLayer', null);
			quickSearch.style.setProperty('display', 'flex');
			quickSearchBg.appendChild(quickSearch);
			document.body.appendChild(quickSearchBg);
		}else{
			/* 검색창 닫기 */
			document.querySelector('#quickSearch > div.searchZone > div').innerText = '';

			if(document.getElementById('inventoryZone')) addProductStock(false);
			isSearchFocus[0][0] = false; isSearchFocus[1][0] = false; isSearchFocus[2][0] = false;
			cancelCheck('subDialog');
			selectSearchPart();
			quickSearchBg = document.getElementsByClassName('bgLayer')[0];
			quickSearch.style.setProperty('display', 'none');
			document.body.appendChild(quickSearch);
			quickSearchBg.remove();
		}
	}
}

/* 검색 그룹 선택 
 * param[0] >> 0(매입처) 1(거래처) 2(상품)
 * */
let isSearchFocus = [[false,'0'], [false, '1'], [false, '2']];
function selectSearchPart(...param){
	/* ColorGroup 초기화 */
	document.querySelector('#quickSearch > div.searchZone').children[1].innerText = '';
	if(document.querySelector('.resultZone .content .panel').children.length == 2)
		document.querySelector('.resultZone .content .panel').innerHTML = '';

	const word = document.getElementsByName('word')[0];
	word.value = '';
	
	const searchPart = document.querySelectorAll('#quickSearch .searchPart');
	/* isSearchFocus 배열 활용 on, off 컨트롤 */
	if(param.length != 0){
		if(!isSearchFocus[param[0]][0]) isSearchFocus[param[0]][0] = !isSearchFocus[param[0]][0];
		searchPart[param[0]].classList.add('on');
		for(let idx=0; idx<isSearchFocus.length; idx++){
			if(idx != param[0]){
				isSearchFocus[idx][0] = false;
				searchPart[idx].classList.remove('on');
			}
		}
		word.focus();
	}else{
		for(let idx=0; idx<isSearchFocus.length; idx++){
			isSearchFocus[idx][0] = false;
			searchPart[idx].classList.remove('on');
		}
	}
}

function getQuickSerchEvent(){
	/* 자동완성 데이터 생성 */
	const partnerInput = document.getElementsByClassName('wordBox')[0];

	partnerInput.addEventListener('click', () =>{	
		document.getElementsByClassName('wordBox')[0].select();
	});
	
	/* 검색값과 일치하는 데이터 탐색 */
	partnerInput.addEventListener('keyup', e => {
		if(isSearchFocus[0][0] == false && isSearchFocus[1][0] == false && isSearchFocus[2][0] == false) return;

		let searchList = '';
		searchList = document.getElementsByClassName('resultZone')[0];

		/* 검색 단어와 색 단어 분리*/
		let searchWord = partnerInput.value.trim().split('@');
		let key = null, columnsInfo = null;
		(isSearchFocus[0][0])? (key = isSearchFocus[0][1], columnsInfo = quickSearchcolumns[0]) : (isSearchFocus[1][0])? (key = isSearchFocus[1][1], columnsInfo = quickSearchcolumns[1]) : (key = isSearchFocus[2][1], columnsInfo = quickSearchcolumns[2]);
		if(partnerInput.value) getSearchDatas(searchWord[0], key, e);
		
		/* 색 검색 */
		if(searchWord.length > 1 && searchWord[1].length > 0){
			cubeJsonData[1]['search'].forEach(row => {
				let ogCode = row['originalCode'].substr(0, 5);
				for(const color of cubeJsonData[0].cubeMasterKey.cubeMasterCG){
					if(color['ogCode'] == ogCode && color['colorName'] == searchWord[1]) {
						cubeJsonData[1]['search'] = [];
						cubeJsonData[1]['search'].push(cubeJsonData[0].cubeMasterKey.cubeMasterOG[row['idx']]);
						break;
					}
				};
			});
		}
		
		/* Search Data Display */
		makeCubeGridInWorkBoard(searchList, columnsInfo,'search', true, true);
		if(true){
			for(const [idx, row] of searchList.querySelectorAll('.row').entries()){
				row.setAttribute('title', cubeJsonData[1]['search'][idx]['searchColorGroup'] != null? cubeJsonData[1]['search'][idx]['searchColorGroup'] : '');
			}
		}
		//
		getSelectRow(partnerInput, key, e);
	});
}

/**  상품 클릭 시 스펙 입력 Object 
 * info
	 * partner : 거래처 
	 * buy : 매입처
		 * [0] >> 제지사
		 * [1] >> 자사
	 * deliveryPlace : 납품처
	 * wnDate(9~10) : 납기희망일시
 * product
 * stockType
   -1 >> 정상,주문, 공용
    0 >> 매입 잡은 거래처의 주문
    1 >>> 매입 없는 거래처의 주문
 * orderType
	 0 >> 매입
	 1 >> 매출
	 2 >> 지업사
*/
const tempSelectDatasList = []; // 주문 데이터 리스트
let tempSelectDatas = []; // 주문임시데이터
tempSelectDatas['info'] = {"partner": null, "buy" : null, "deliveryPlace" : null, "wnDate" : null};
tempSelectDatas['product'] = [];

/**
 * Popup Board Status Controller
 * @param   [display true|false]
 * @param   [idx]
 */
function popupBoardStatusCtl(...param){
    
    if(param[0]){
        groupPopup[param[1]][1].classList.remove('off');
        groupPopup[param[1]][1].classList.add('on');
    }else{
        groupPopup[param[1]][1].classList.remove('on');
        groupPopup[param[1]][1].classList.add('off');
    } 
}

/* 검색 데이터 
 * param[0] >> QuickSearch textInput : HTMLNode
 * param[1] >> JsonData Key
 * param[2] >> evt
 */

//특수문자 기능 해제
const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* Fuzzy 검색을 위한 정규식 만들기 */
function makeFuzzyPatten(char) {
	// ( 자음번호 * 588 + 모음번호 * 28 + 종성번호 ) + 44032
	const startChar = 44032;

	// 정규식 패턴 저장 변수
	let patten = null; regExpBegin = null, regExpEnd = null;

	// 한글 음절 범위 체크
	if (/[가-힣]/.test(char)) {
		const charCode = char.charCodeAt(0) - startChar;
		// 종성이 있는 경우 종성 그대로 문자 검색
		if (charCode % 28 > 0) return char;

		regExpBegin = Math.floor(charCode / 28) * 28 + startChar;
		regExpEnd = regExpBegin + 27;
		pattern = `[\\u${regExpBegin.toString(16)}-\\u${regExpEnd.toString(16)}]`;
	} else if(/[ㄱ-ㅎ]/.test(char)){ // 한글 자음 범위 체크
		const chosung = {
				'ㄱ': '가'.charCodeAt(0), 'ㄲ': '까'.charCodeAt(0), 'ㄴ': '나'.charCodeAt(0), 'ㄷ': '다'.charCodeAt(0), 'ㄸ': '따'.charCodeAt(0),
				'ㄹ': '라'.charCodeAt(0), 'ㅁ': '마'.charCodeAt(0), 'ㅂ': '바'.charCodeAt(0), 'ㅃ': '빠'.charCodeAt(0), 'ㅅ': '사'.charCodeAt(0),
		};

		regExpBegin = chosung[char] || ((char.charCodeAt(0) - 12613) * 588 + chosung['ㅅ'] );
		regExpEnd = regExpBegin + 587;
		pattern = `[${char}\\u${regExpBegin.toString(16)}-\\u${regExpEnd.toString(16)}]`;
	} else { //영문 숫자
		pattern = escapeRegExp(char);
	}

	return pattern;
}

function getSearchDatas(...param){
	const regPattern = param[0].toLowerCase().split('').map(makeFuzzyPatten)
	.map((regPattern) => '(' + regPattern + ')')
	.join('.*?');
	const searchRegex = new RegExp(regPattern);
	const dataList = cubeJsonData[1]['quickSearch'][param[1]];	

	dataList.map((data, index) => {data.idx = index;});
	
	/* SearchData == JsonData 경우 데이터 생성*/
	const datas = dataList.filter((data) => {
		if(param[1] == '2') return searchRegex.test(data['weight'] + data['searchWordGroup'].toLowerCase() + data['paperMakerName'].trim() + data['originalName'].trim().toLowerCase() + data['fsc'].toLowerCase().trim() + data['weight']) 
		else return searchRegex.test(data['partnerName'].trim().toLowerCase() + data['partnerCeo'] + data['partnerCode'] + data['partnerPhone'].trim());
	});
	
	/* 주문서가 실행되어 있는 경우 거래중지 거래처 제외
	if(canvasBox.filter(canvas=>{if(canvas.id == 'om10') return canvas}).length == 1 && param[1] == '1' ) {
		datas = datas.filter((data) => {
			
		});
	} */
	cubeJsonData[1]['search'] = datas;	
}

let nowIdx = 0;
function getSelectRow(...param){
	const dataList =  document.getElementsByClassName('resultZone')[0].children[1].children[0].children[1];
	let nowData = null;

	switch(param[2].keyCode){
	case 38:
		nowIdx = Math.max(nowIdx - 1,0);
		nowData = dataList.children[nowIdx];
		nowData.scrollIntoView({block:'center'});
		break;

	case 40:
		nowIdx = Math.min(nowIdx + 1, cubeJsonData[1]['search'].length - 1);
		nowData = dataList.children[nowIdx];
		nowData.scrollIntoView({block:'center'});
		break;

	case 13:
	    if(canvasBox.length != 0) setBoardInput(param[1], cubeJsonData[1]['search'][nowIdx]);
    	else successGoods(cubeJsonData[1]['search'][nowIdx]);
		nowIdx = 0;
		nowData = null;
		break;

	default:
		nowIdx = 0;
		nowData = document.getElementsByClassName('resultZone')[0].children[1].children[0].children[1].children[nowIdx];
		break;
	}
	
	if(nowData != null){
		nowData.classList.add('on');
		if(true){
			for(const row of document.querySelectorAll('#quickSearch > div.resultZone > div.content > div > div.records > div')){
				if(row.classList.contains('on')){
					const searchZone = document.querySelector('#quickSearch > div.searchZone');
					searchZone.children[1].innerText = '';
					if(row.getAttribute('title')) makeColorButton(row, 'title', document.querySelector('#quickSearch > div.searchZone'));
					break;
				}
			};
		}else document.querySelector('#quickSearch > div.searchZone > div').innerHTML = '';
	}
}

function makeColorButton(row, attr, target){
	const colorGroupArray = row.getAttribute(attr).split('|');
	if(colorGroupArray.length > 0){
		colorGroupArray.forEach((color) => {
			const colorObj = document.createElement('div');
			colorObj.setAttribute('class', 'cg');
			colorObj.innerText = color;
			colorObj.addEventListener('click', ()=>{
				const displayObj = target.children[0];
				if( displayObj.value.indexOf('@') != -1 ){ displayObj.value = displayObj.value.split('@')[0];}
				displayObj.value += '@' + color;
				for(let colorObject of cubeJsonData[0]['cubeMasterKey']['cubeMasterCG']){
				    if(colorObject['colorName'] == color){
				        cubeJsonData[1]['color'] = colorObject;
				        break;
				    }
				}
			});
			target.children[1].appendChild(colorObj);
		});
	}
}

/* boardId+display
 * @param {String} 0(매입처) 1(거래처) 2(상품) 
 * @param {int}	   Item Index */
function setBoardInput(...param){
	const callFunc = canvasBox[parseInt(currentCanvasIdx)-2].id + 'display';
	window[callFunc](param[0], param[1]['idx']);
}

function successPartner(...param){
	(isSearchFocus[0][0]) ?setBoardInput(0, param[0]) :setBoardInput(1, param[0])
}

/* Scrapping Call 
 * @param[0]  {String} jsonDataKey
 * @param[1]  {Integer} jsonDataIdx
 * @param[2]  {Array} HiddenData
 */
function successGoods(...param){
	if(canvasBox != null && ['mo30'].includes(canvasBox[currentCanvasIdx-2].id)){
		setBoardInput(param[0], param[0]); return;
	}

	if(!cubeJsonData[1]['stock'] && !cubeJsonData[1]['orderListGrid']){
		cubeJsonData[1]['stock'] = [];
		cubeJsonData[1]['stock']['orderList'] = [];
		cubeJsonData[1]['orderListGrid'] = [];
	}
	const clickedIdx = cubeJsonData[1]['search'].indexOf(param[0]);
    for(const [idx, row] of document.querySelectorAll('#quickSearch > .resultZone > .content > div > .records > div').entries()){
        if(idx != clickedIdx) row.classList.remove('on');
        else{
            row.classList.add('on');
            if(row.getAttribute('title')){
                document.querySelector('#quickSearch > div.searchZone > div').innerHTML = '';
                makeColorButton(row, 'title', document.querySelector('#quickSearch > div.searchZone'));
            }
        }
    }
	const bgLayer = document.getElementsByClassName('bgLayer')[0];
	let inventoryZone = null, width = null, height = null;
	cubeJsonData[1]['color'] = null;
	if(!document.getElementById('inventoryZone')) {
		inventoryZone = createDIV('inventoryZone');
		bgLayer.appendChild(inventoryZone);
	}
	else {
		inventoryZone = document.getElementById('inventoryZone');
        if(document.querySelector('#inventorySearchCondition .line:nth-child(2) input:nth-child(1)'))
            width = document.querySelector('#inventorySearchCondition .line:nth-child(2) input:nth-child(1)').value;
        if(document.querySelector('#inventorySearchCondition .line:nth-child(2) input:nth-child(2)'))
            height = document.querySelector('#inventorySearchCondition .line:nth-child(2) input:nth-child(2)').value;
		inventoryZone.innerHTML = '';
	}

	const divs = 
		[
			createDIV('inventorySearchCondition'),
			createDIV('inventorySinseungCenterZone'),
			createDIV('inventoryPaperMakerZone'),
		];
	divs.forEach(div =>{inventoryZone.appendChild(div);})
	const quickSearch = document.getElementById('quickSearch');
	quickSearch.style.setProperty('left', '35%');
	const goods = cubeJsonData[0].cubeMasterKey.cubeMasterOG[param[0]['idx']];
	cubeJsonData[1]['stock']['selectedGoods'] = goods;
	cubeJsonData[1]['stock']['orderPm'] = goods['paperMakerCode'];
	const Btns = [createButton('button', '검색', 'searchPart btn')];
	const searchCondition =
		[
			[
				createInputBox('text', '', '', '', 'searchPart line_1 on'),
				createInputBox('text', '', '', '', 'searchPart line_1 '),
				createDIV(null, 'searchPart line_1', null)
			],
			[
				createInputBox('text', '', '', '가로', 'searchPart line_2'),
				createInputBox('text', '', '', '세로', 'searchPart line_2'),
				createToggleSwitch('종목|횡목', 'directionCheck', 'directionLabel', 'changeDirectionCallback'),
				createInputBox('date', '', '', '', 'searchPart line_2')
			],
		]

	if(goods['paperMakerCode'] == 'CN'){
        const options = [
            {'levCode': 100, 'levName': 100},
            {'levCode': 150, 'levName': 150},
            {'levCode': 200, 'levName': 200},
            {'levCode': 250, 'levName': 250},
            {'levCode': 300, 'levName': 300},
            {'levCode': 350, 'levName': 350},
            {'levCode': 400, 'levName': 400},
            {'levCode': 450, 'levName': 450},
            {'levCode': 500, 'levName': 500},
            {'levCode': 550, 'levName': 550},
            {'levCode': 600, 'levName': 600},
            {'levCode': 650, 'levName': 650},
            {'levCode': 700, 'levName': 700},
            {'levCode': 750, 'levName': 750},
            {'levCode': 800, 'levName': 800},
            {'levCode': 850, 'levName': 850},
            {'levCode': 900, 'levName': 900},
        ];
        const selectBox = createSelect('range', options, 'searchPart', '50');
    	searchCondition[1].push(selectBox);
    	selectBox.style.setProperty('width', '15%');
    	selectBox.style.setProperty('height', '30px');
    	selectBox.options[1].selected = true;
	}
    searchCondition[1].push(Btns[0]);
	searchCondition.forEach((inputs, idx) =>{
		const line = createDIV(null, 'line');
		divs[0].appendChild(line);
		inputs.forEach((input, inputIdx) =>{
			if(idx == 0) {input.readOnly = true;}
			else {
				input.style.setProperty('width', inputIdx == 3? '28%' : inputIdx == 2? '90px' : 'calc((100% - 90px - 45%) / 2)');
			}
			line.appendChild(input);
		})
	})
	searchCondition[0][0].value = goods.originalName;
	searchCondition[0][0].style.setProperty('width', '70%');
	searchCondition[0][1].value = goods.weight + 'g/㎡' ;
	searchCondition[0][1].style.setProperty('width', (goods.fsc != '')? 'calc(30% / 2 - 5px)': '30%');
	searchCondition[0][2].innerText = goods.fsc;
	searchCondition[0][2].style.setProperty('width', (goods.fsc != '')? 'calc(30% / 2 - 5px)': '0px');
	searchCondition[0][2].style.setProperty('display', (goods.fsc != '')? 'block':'none');
	searchCondition[1][0].focus();

	let today = '';
	let dateValue = new Date();
	let year = dateValue.getFullYear();
	let month = ('0' + (1 + dateValue.getMonth())).slice(-2);
	let day = ('0' + dateValue.getDate()).slice(-2);
	today = year + '-' + month + '-' + day;
	searchCondition[1][3].value = today;

	if(width != null) searchCondition[1][0].value = width;
    if(height != null) searchCondition[1][1].value = height;
	/* 용지 사이즈 단축키 */
	const sizeQuickKey = [
        [
            ['46', 788, 1091], ['64', 1091, 788], ['75', 788, 545], ['57', 545, 788],
            ['68', 625, 880], ['86', 880, 625], ['69', 636, 939], ['96', 939, 636]
        ],
        [
            ['46', 788, 1092], ['64', 1092, 788], ['75', 788, 546], ['57', 546, 788],
            ['69', 640, 940], ['96', 940, 640]
        ]
    ];

	const goodsPaperDivision = cubeJsonData[0].cubeMasterKey.cubeMasterPP.
	filter((pp)=> {if(pp.originalCode == goods.originalCode) return pp});
	searchCondition[1][0].addEventListener('keyup', (e)=>{
		if(e.key == 'Enter') {
			if(searchCondition[1][0].value.length == 2){
				const divisionIdx = (goodsPaperDivision[0].paperCode != 'P200')? 0 : 1;
				for (const keys of sizeQuickKey[divisionIdx]) {
					if(keys[0] == searchCondition[1][0].value){
						searchCondition[1][0].value = keys[1];
						searchCondition[1][1].value = keys[2];
						if(keys[1] > keys[2]) {
							if(!searchCondition[1][2].firstChild.checked) searchCondition[1][2].firstChild.click();
							else Btns[0].click();
						}else if(searchCondition[1][2].firstChild.checked) searchCondition[1][2].firstChild.click();
						else Btns[0].click();
						break;
					}
				}
			}else searchCondition[1][1].focus();
		}
	});

	searchCondition[1][1].addEventListener('keyup', (e)=>{
		if(e.key == 'Enter') {
			if(searchCondition[1][1].value != ''){
				if(!searchCondition[1][2].firstChild.checked) {
					if(Number(searchCondition[1][0].value) > Number(searchCondition[1][1].value)) searchCondition[1][2].firstChild.click();
					else Btns[0].click();
				}else{
					if(Number(searchCondition[1][0].value) < Number(searchCondition[1][1].value)) searchCondition[1][2].firstChild.click();
					else Btns[0].click();
				}
			}else Btns[0].click();
		}
	});

	// 전송 폼 ( 검색 버튼 클릭 시 )
	Btns[0].addEventListener('click', ()=>{
	    if(Btns[0].dataset['wait'] == 1) return;
		const inputs = document.querySelectorAll('#inventorySearchCondition input');
        let ogType = null;
        const sizeCode = setString2(inputs[2].value) + setString2(inputs[3].value);
        if(sizeCode.includes('0000')){ ogType = 3; }
        else if(sizeCode.includes('788')) { ogType = 0;}
        else if(sizeCode.includes('636')) { ogType = 1;}
        else if(sizeCode.includes('625')) { ogType = 2;}
        console.log(getNoticePrice(goods['originalCode'], ogType, inputs[2].value, inputs[3].value));
		if(inputs[2].value.length == 0 && inputs[3].value.length == 0) return;
		if(goods['paperMakerCode'] == 'CN' && searchCondition[1][1].value == '') {
			alert('깨나라 세로 입력 필수');
			return;
		}
		const formData = new FormData();
		formData.append('ogCode', goods['originalCode']);
		formData.append('ogName', goods['originalName']);
		formData.append('width', inputs[2].value);
		formData.append('height', inputs[3].value);
		formData.append('ogWeight', goods['weight']);
		formData.append('ogPmcode', goods['paperMakerCode']);
		formData.append('ogPmMapping', goods['paperMakerMappingCode']);
		formData.append('date', inputs[5].value);
		{
			if (document.querySelector('#inventorySearchCondition > div:nth-child(2) > select')) {
				formData.append('range', document.querySelector('#inventorySearchCondition > div:nth-child(2) > select').value)
			}
		}
		if(goodsPaperDivision[1]['paperCode'] != 'P110') formData.append('paperCode', goodsPaperDivision[1]['paperCode']);
        else formData.append('paperCode', goodsPaperDivision[2]['paperCode']);
		if(tempSelectDatas['info']['partner']) formData.append('prCode', tempSelectDatas['info']['partner']['partnerCode']);
		if(quickSearch.querySelector('#toggle').checked) quantityController(divs[0], goods, tempSelectDatas['info']['buy']);
		else{
			if(document.getElementById('inventoryPaperMakerZone')) document.getElementById('inventoryPaperMakerZone').innerHTML = '';
			serverCallByFetchAfterAuth(formData, '/STOCKTSEARCHING', 'POST', 'callStockList', goods['originalCode']);
			Btns[0].setAttribute('data-wait', 1);
		}
	})
	if(!document.querySelector('#quickSearch > .titleZone > .title.header > .toggleBox').firstChild.checked && (width != null || height != null)) {
		Btns[0].click();
	}
}

/* 규격 앞자리 0 일시 정리 */
function setString(data){
	let res = '';
	if(data.substring(0,1) == '0') res = data.substring(1);
	else res = data;
	return res;
}
/* 규격 앞자리 0 생성 */
function setString2(data){
	let res = '';
	if(data.length == 3) res = 0 + data;
	else res = data;
	return res;
}

/** Stock Scrapping CallBack
 * @param[0] {JSON} 재고데이터
 * @param[1] {String} 원지코드 
 */
function callStockList(...param){
	/* empty Css Class Remove */
	document.querySelector('#inventorySearchCondition > div:nth-child(2) > input.searchPart.btn')
	    .dataset['wait'] = 0;
	document.querySelector('#inventoryPaperMakerZone').classList.remove('empty');
	const [paperMakerStocks, purchaseStocks, centerStocks] = param[0];
	centerStockCallBack(centerStocks);

	const inventoryPaperMakerZone = document.getElementById('inventoryPaperMakerZone');
	inventoryPaperMakerZone.innerHTML = '';
	const inputs = document.querySelectorAll('#inventorySearchCondition .searchPart');
	inputs[4].disabled = false;
	inputs[4].focus();
	const gridDivs = [createDIV('', 'selectBox'), createDIV('', 'header')];
	const [selectBox, header] = gridDivs;
	gridDivs.forEach(gridDiv =>{inventoryPaperMakerZone.appendChild(gridDiv)})

	if(paperMakerStocks['stockList'].length > 0){
	    paperMakerStocks['stockList'].map(stock=>{
	        switch(stock['packaging']){
	            case 'Ream': case 'P': stock['packaging'] = 'R'; break;
	            case 'Skid': case 'B': stock['packaging'] = 'S'; break;
	            case 'Roll': stock['packaging'] = 'R/L'; break;
	        }
	    })
	    cubeJsonData[1]['stock']['stockList'] = paperMakerStocks['stockList'];
		cubeJsonData[1]['stock']['purchaseStockList'] = purchaseStocks;

        let selectDiv = null;
        let records = null;
        let headerCol1 = null;
        let headerCol2 = null;
		switch(cubeJsonData[1]['stock']['orderPm']){
    		/* 한솔 검색결과 */
		    case 'HS': case 'HA': case 'HP': // 한솔
		    console.log('한솔');
			const hansolCenters = ['센터', '장항', '서빙고', '부천', '목천', '파주', '대전'];
			// 아트원
			const artoneCenters = ['센터', '신탄진', '서빙고', '부천', '목천', '파주', '세종'];
			// 한솔파텍
			const partecCenters = ['센터', '천안'];
			paperMakerStocks['stockList'].forEach((stocks, stocksIdx)=>{
                let centers = null;
                switch(stocks['paperMakerName']){
                    case '한솔': centers = hansolCenters; break;
                    case '아트원': centers = artoneCenters; break;
                    case '파텍': centers = partecCenters; break;
                }
				if(stocks['packaging'] != null){ // 추가 row가 아닐 때
				    packaging = stocks['packaging'];
					selectDiv = createDIV('', 'col title');
					records =  createDIV('', 'records');
					inventoryPaperMakerZone.appendChild(records);
					selectBox.appendChild(selectDiv);
					selectDiv.innerText = `${stocks['paperMakerName']} ${stocks['size']} ${stocks['packaging']}`;
					selectDiv.addEventListener('click', function(){
						if(!this.classList.contains('on')) this.classList.add('on')
						cubeJsonData[1]['stock']['orderPm'] = stocks['paperMakerName'] != '아트원' ?'HS' :'HA';
    					for(let div of selectBox.children){
                            if(div != this && div.classList.contains('on'))div.classList.remove('on');
                        }
						const selectBoxs = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .selectBox .col:not(:nth-last-child(1))'))
						const records = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .records'));
						selectBoxs.forEach((selectBox, selectIdx)=>{
							if(selectBox == this) records[selectIdx]?.style.setProperty('display', 'flex');
							else records[selectIdx]?.style.setProperty('display', 'none');
                            header.innerHTML = '';
                            centers.forEach((center, centerIdx)=>{
                                const headerCol = centerIdx != 0 ?createDIV('', 'rowHeader')
                                :createDIV('', 'colHeader');
                                headerCol.innerText = center;
                                header.appendChild(headerCol);
                            })
						})
					})
					centers.forEach((center, centerIdx)=>{
						let col = null;
						const className = centerIdx != 0 ? 'col': 'colHeader';
						const cols = createDIV('', 'cols');
						records.appendChild(cols);
						const col1 = createDIV('', className);
						cols.appendChild(col1);
						const col2 = createDIV('', className);
						cols.appendChild(col2);
						const col3 = createDIV('', className);
						cols.appendChild(col3);
						if(centerIdx == 0){
							col1.innerText = '공용';
							col2.innerText = '주문';
							col3.innerText = '매입';
						} else col = (stocks['stockList'][0] == '공용')? col1 : (stocks['stockList'][0] == '주문') ?col2 :col3;
						for(let i=1; i<stocks['stockList'].length; i++){
							if(center == stocks['stockList'][i].split(" ")[0] && col){
								const spanBig = document.createElement('span');
								spanBig.classList.add('big');
								spanBig.innerText = stocks['stockList'][i].split(" ")[1];
								const spanSmall = document.createElement('span');
								spanSmall.classList.add('small');
								if(stocks['packaging'] != 'R/L')
    								spanSmall.innerText = `[ ${stocks['qtyUnit']} | ${stocks['palletUnit']} ]`;
    						    else
    								spanSmall.innerText = `[${stocks['filedValue'][i-1]['STOCKWGT']}|${stocks['filedValue'][i-1]['STDWEIGHT']}]`;
								col.appendChild(spanBig);
								col.appendChild(spanSmall);
								if(center != '대전' && center != '천안'){
                                    col.addEventListener('click', (e)=>{
                                        cancelCheck('subDialog');
                                        quantityController(inventoryPaperMakerZone, stocks, center, i, param[1]);
                                    })
								}
							}
						}
					}) // 센터 반복문
				}else{
					let cols = null;
					for(let j=1; j<stocks['stockList'].length; j++){
						for(let i=1; i<centers.length; i++){
							if(centers[i] == stocks['stockList'][j].split(' ')[0]){
								cols = records.children[i];
								const col = (stocks['stockList'][0] == '주문') ?cols.children[1] :cols.children[2];
								const spanBig = document.createElement('span');
								spanBig.classList.add('big');
								spanBig.innerText = stocks['stockList'][j].split(" ")[1];
								const spanSmall = document.createElement('span');
								spanSmall.classList.add('small');
								spanSmall.innerText = `[ ${stocks['qtyUnit']} | ${stocks['palletUnit']} ]`;
								col.appendChild(spanBig);
								col.appendChild(spanSmall);
								const center = stocks['stockList'][j].split(' ')[0];
                                if(center != '대전' && center != '천안'){
                                    col.addEventListener('click', (e)=>{
                                        cancelCheck('subDialog');
                                        quantityController(inventoryPaperMakerZone, stocks, center, j, param[1]);
                                    })
								}
								break;
							}
						}
					}
				}
			})
    		break; // 한솔 끝

    		case 'MR': case 'MP': case 'MS': // 무림 검색결과/
    		console.log('무림');
			const moorimCenters = ['센터', '시흥', '청라', '교하', '진주', '울산', '대구', '을지로'];
			let before = null;
			paperMakerStocks['stockList'].forEach((stocks, stocksIdx)=>{
				if(before != stocks['paperMakerName'] + stocks['size'] + stocks['packaging']){
					selectDiv = createDIV('', 'col title');
					records =  createDIV('', 'records');
					selectBox.appendChild(selectDiv);
					inventoryPaperMakerZone.appendChild(records);
                    selectDiv.innerText = `${stocks['paperMakerName']} ${stocks['size']} ${stocks['packaging']}`;
					selectDiv.addEventListener('click', function(){
						if(!this.classList.contains('on')) this.classList.add('on')
						for(let div of selectBox.children){
							if(div != this && div.classList.contains('on'))div.classList.remove('on');
						}
						const selectBoxs = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .selectBox .col'))
						const records = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .records'));
						selectBoxs.forEach((selectBox, selectIdx)=>{
							if(selectBox == this) records[selectIdx]?.style.setProperty('display', 'flex');
							else records[selectIdx]?.style.setProperty('display', 'none');
						})
						switch (stocks['paperMakerName']){
							case "무림페이퍼": cubeJsonData[1]['stock']['orderPm'] = 'MR'; break;
							case "무림P&P": cubeJsonData[1]['stock']['orderPm'] = 'MP'; break;
							case "무림에스피": cubeJsonData[1]['stock']['orderPm'] = 'MS'; break;
						}
					})
				}
				moorimCenters.forEach((moorimCenter, centerIdx) =>{
					let col = null;
					if(stocksIdx == 0){
						const headerCol = centerIdx != 0 ?createDIV('', 'rowHeader')
							:createDIV('', 'colHeader');
						headerCol.innerText = moorimCenter;
						header.appendChild(headerCol);
					}
					if(before != stocks['paperMakerName'] + stocks['size'] + stocks['packaging']){
						const className = centerIdx != 0 ? 'col': 'colHeader';
						const cols = createDIV('', 'cols');
						records.appendChild(cols);
						const col1 = createDIV('', className);
						cols.appendChild(col1);
						const col2 = createDIV('', className);
						cols.appendChild(col2);
						const col3 = createDIV('', className);
						cols.appendChild(col3);
						if(centerIdx == 0){
							col1.innerText = '정상';
							col2.innerText = '주문';
							col3.innerText = '임대';
						}
					}
					for(let i=1; i<stocks['stockList'].length; i++){
						if(moorimCenter == stocks['stockList'][i].split(" ")[0]){
							if(centerIdx != 0){
								switch(stocks['filedValue'][i-1]['callflage']){
									case 'ZBB': col = records.children[centerIdx].children[0]; break;
									case 'ZOO': col = records.children[centerIdx].children[1]; break;
									case 'XOG': col = records.children[centerIdx].children[2]; break;
								}
								const spanBig = document.createElement('span');
								spanBig.classList.add('big');
								spanBig.innerText = stocks['stockList'][i].split(" ")[1];
								const spanSmall = document.createElement('span');
								spanSmall.classList.add('small');
								spanSmall.innerText = `[ ${stocks['qtyUnit']} | ${stocks['palletUnit']} ]`;
								col.appendChild(spanBig);
								col.appendChild(spanSmall);
								col.addEventListener('click', (e)=>{
									cancelCheck('subDialog');
									quantityController(inventoryPaperMakerZone, stocks, moorimCenter, i, param[1]);
								})
							}
						}
					}
				}) // 센터 반복문 
				if(before != stocks['paperMakerName'] + stocks['size'] + stocks['packaging']) before = stocks['paperMakerName'] + stocks['size'] + stocks['packaging'];
			}); // 상품 반복문
            break; // 무림 끝

            case 'HK': /* 한국 검색결과 */
            console.log('한국');
			const hankookCenters = ['', '합계', '파주', '오봉', '온산'];
			paperMakerStocks['stockList'].forEach((stocks, stocksIdx)=>{
				const selectDiv = createDIV('', 'col title', null);
				selectBox.appendChild(selectDiv);
				const records =  createDIV('', 'records', null);
				inventoryPaperMakerZone.appendChild(records);
                selectDiv.innerText = `${stocks['paperMakerName']} ${stocks['size']} ${stocks['packaging']}`;
				selectDiv.addEventListener('click', function(){
					if(!this.classList.contains('on')) this.classList.add('on')
					for(let div of selectBox.children){
						if(div != this && div.classList.contains('on'))div.classList.remove('on');
					}
					const selectBoxs = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .selectBox .col:not(:nth-last-child(1))'))
					const records = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .records'));
					selectBoxs.forEach((selectBox, selectIdx)=>{
						if(selectBox == this) records[selectIdx]?.style.setProperty('display', 'flex');
						else records[selectIdx]?.style.setProperty('display', 'none');
					})
				})
				let bogan = null;
				let jungsangSum = null;
				hankookCenters.forEach((center, centerIdx) =>{
					if(stocksIdx == 0){
						const headerCol = createDIV('', centerIdx == 0 ?'colHeader' :'rowHeader');
						headerCol.innerText = center;
						header.appendChild(headerCol);
					}
					const cols = createDIV('', 'cols');
					if(stocksIdx != 0) records.style.setProperty('display', 'none');
					records.appendChild(cols);
					let col1 = null;
					let col2 = createDIV('', 'col');
					if(centerIdx == 0){
						col1 = createDIV('', 'colHeader')
						col2 = createDIV('', 'colHeader');
						cols.appendChild(col1);
						col1.innerText = '정상';
						col2.innerText = '보관';
						header.children[0].innerText = '센터';
					}else if(centerIdx == 1){
						col1 = createDIV('', 'col');
                        let spanBig = document.createElement('span');
                        spanBig.classList.add('big');
						if(stocks['stockList'][0].split(' ').length != 3){
							if(stocks['stockList'][0].split(' ')[0] != '정상'){
							    spanBig.innerText = stocks['stockList'][0].split(' ')[1];
                                spanBig.classList.add('big');
							    col2.appendChild(spanBig);
							}else{
							    jungsangSum = stocks['stockList'][0].split(' ')[1];
							    spanBig.innerText = stocks['stockList'][0].split(' ')[1];
                                spanBig.classList.add('big');
							    col1.appendChild(spanBig);
							}
						}else{
                            spanBig = document.createElement('span');
                            spanBig.classList.add('big');
						    spanBig.innerText = stocks['stockList'][0].split('|')[1].split(' ')[1];
						    col1.appendChild(spanBig);
                            jungsangSum = stocks['stockList'][0].split('|')[1].split(' ')[1];

                            spanBig = document.createElement('span');
                            spanBig.classList.add('big');
                            spanBig.innerText = stocks['stockList'][0].split('|')[0].split(' ')[1];
                            col2.appendChild(spanBig);
							bogan = stocks['stockList'][0].split('|')[0].split(' ')[1];
						}
					}else{
						col1 = createDIV('', 'col');
						for(let i=1; i<stocks['stockList'].length; i++){
							if(stocks['stockList'][i].split(' ')[0] == center){
							    if(stocks['stockList'][i].split(' ')[1] > jungsangSum)
							        stocks['stockList'][i] = `${center} ${jungsangSum}`

							    if(stocks['stockList'][i] != `${center} 0.0`){
                                    let spanBig = document.createElement('span');
                                    spanBig.innerText = stocks['stockList'][i].split(" ")[1];
                                    spanBig.classList.add('big');
                                    const spanSmall = document.createElement('span');
                                    spanSmall.innerText = `[ ${stocks['qtyUnit']} | ${stocks['palletUnit']} ]`
                                    spanBig.classList.add('small');
                                    col1.appendChild(spanBig);
                                    col1.appendChild(spanSmall);
                                    col1.addEventListener('click', (e)=>{
                                        cancelCheck('subDialog');
                                        quantityController(inventoryPaperMakerZone, stocks, center, i, param[1]);
                                        stocks['filedValue'][i-1]['clickedCenter'] = center;
                                    })
							    }

							    spanBig = document.createElement('span');
								spanBig.classList.add('big');
							    spanBig.innerText = (bogan) ?bogan :'';
								col2.appendChild(spanBig);
								col2.addEventListener('click', (e)=>{
									cancelCheck('subDialog');
									quantityController(inventoryPaperMakerZone, stocks, '보관', i, param[1]);
									stocks['filedValue'][i-1]['clickedCenter'] = center;
								})
							}
						} // 사이즈 반복문
					}
					cols.appendChild(col1);
					cols.appendChild(col2);
				}) // 센터 반복문 
			}); // 상품 반복문
			break; // 한국 끝

		    case 'HW': /* 홍원 검색결과 */
		    console.log('홍원');
			const hongWonCenters = ['센터', '홍원'];
			headerCol1 = createDIV('', 'colHeader');
			headerCol1.innerText = '센터';
			header.appendChild(headerCol1);
			headerCol2 = createDIV('', 'rowHeader');
			headerCol2.innerText = '홍원';
			header.appendChild(headerCol2);
			paperMakerStocks['stockList'].forEach((stocks, stocksIdx)=>{
				const selectDiv = createDIV('', 'col title', null);
                selectDiv.innerText = `${stocks['paperMakerName']} ${stocks['size']} ${stocks['packaging']}`;
				selectBox.appendChild(selectDiv);
				const records =  createDIV('', 'records', null);
				inventoryPaperMakerZone.appendChild(records);

				selectDiv.addEventListener('click', function(){
					if(!this.classList.contains('on')) this.classList.add('on')
					for(let div of selectBox.children){
						if(div != this && div.classList.contains('on'))div.classList.remove('on');
					}
					const selectBoxs = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .selectBox .col:not(:nth-last-child(1))'))
					const records = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .records'));
					selectBoxs.forEach((selectBox, selectIdx)=>{
						if(selectBox == this) records[selectIdx]?.style.setProperty('display', 'flex');
						else records[selectIdx]?.style.setProperty('display', 'none');
					})
				})
				let cols1 = createDIV('', 'cols');
				records.appendChild(cols1);
				let col11 = createDIV('', 'colHeader');
				cols1.appendChild(col11);
				col11.innerText = '정상';
				let col21 = createDIV('', 'colHeader');
				cols1.appendChild(col21);
				col21.innerText = '보관';

				let cols2 = createDIV('', 'cols');
				records.appendChild(cols2);
				let col12 = createDIV('', 'col');
				cols2.appendChild(col12);
				col12.innerText = (stocks['stockList'][0]) ?stocks['stockList'][0].split(' ')[1] :'';
				if(col12.innerText == '') cols2.classList.add('null');
				else{
					col12.addEventListener('click', ()=>{
						cancelCheck('subDialog');
						quantityController(inventoryPaperMakerZone, stocks, '물류', 1, param[1]);
					})
				}
				let col22 = createDIV('', 'col');
				col22.innerText = (stocks['stockList'][2])? stocks['stockList'][2].split(' ')[1] :'';
				if(col22.innerText == '') col22.classList.add('null');
				cols2.appendChild(col22);
			}); // 상품 반복문
            break; // 홍원 끝

            case 'CN': /* 깨나라 검색결과*/
            console.log('깨나라');
			headerCol1 = createDIV('', 'colHeader');
			headerCol1.innerText = '센터';
			header.appendChild(headerCol1);
			headerCol2 = createDIV('', 'rowHeader');
			header.appendChild(headerCol2);
			paperMakerStocks['stockList'].forEach((stocks, stocksIdx)=>{
				const selectDiv = createDIV('', 'col title', null);
			    const size = `${setString(stocks['size'].split('*')[0])}*${setString(stocks['size'].split('*')[1])}`
                selectDiv.innerText = `${stocks['paperMakerName']} ${stocks['size']} ${stocks['packaging']}`;
				selectBox.appendChild(selectDiv);
				const records =  createDIV('', 'records', null);
				inventoryPaperMakerZone.appendChild(records);
				
				selectDiv.addEventListener('click', function(){
					headerCol2.innerText = stocks['stockList'][1].split(' ')[0];
					if(!this.classList.contains('on')) this.classList.add('on')
					for(let div of selectBox.children){
						if(div != this && div.classList.contains('on'))div.classList.remove('on');
					}
					const selectBoxs = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .selectBox .col:not(:nth-last-child(1))'))
					const records = Array.from(document.querySelectorAll('#inventoryPaperMakerZone .records'));
					selectBoxs.forEach((selectBox, selectIdx)=>{
						if(selectBox == this) records[selectIdx]?.style.setProperty('display', 'flex');
						else records[selectIdx]?.style.setProperty('display', 'none');
					})
				})
				let cols = createDIV('', 'cols');
				records.appendChild(cols);
				let col1 = createDIV('', 'colHeader');
				cols.appendChild(col1);
				col1.innerText = '가용';
				let col2 = createDIV('', 'colHeader');
				cols.appendChild(col2);
				col2.innerText = '총';
				cols = createDIV('', 'cols');
				records.appendChild(cols);
				col1 = createDIV('', 'col');
				cols.appendChild(col1);
				col1.innerText = `${stocks['stockList'][0]} ${stocks['stockList'][1].split(' ')[1]}`;
				col1.addEventListener('dblclick', ()=>{
        				cancelCheck('subDialog');
				    	const boxInfo = [[stocks['filedValue'][0]['prodCd'], '상품코드', 'long', false]];
                        btnInfo = [
                            [null, 'confirmCheck singlue', 'cancelFunc(this)', '취소']
                        ];
                        popupContoller(boxInfo, btnInfo, col1, [1.5, 1]);
				})
				if(stocks['stockList'][0] != '타사' && stocks['stockList'][1].split(' ')[0] != 'L006'){
                    col1.addEventListener('click', ()=>{
                        cancelCheck('subDialog');
                        quantityController(inventoryPaperMakerZone, stocks, stocks['stockList'][1].split(' ')[0], 1, param[1]);
                    })
				}
				col2 = createDIV('', 'col');
				col2.innerText = stocks['stockList'][2].split(' ')[1];
				cols.appendChild(col2);
			}); // 상품 반복문
			break; // 깨나라 끝
		}
		/* 값이 없는 column class null 부여 */
		for(const record of inventoryPaperMakerZone.querySelectorAll('.records')){
			for(const cols of record.children){
				if(cols.children[0].textContent == '') cols.children[0].classList.add('null');
				if(cols.children[1].textContent == '') cols.children[1].classList.add('null');
			}
		}
		inventoryPaperMakerZone.querySelector('.selectBox .col')?.click();
	}else {
		document.querySelector('#inventoryPaperMakerZone').classList.add('empty');
	}
	/* 구두발주 버튼 */
	const manualAddProduct = createDIV('', 'col title');
	inventoryPaperMakerZone.querySelector('.selectBox').appendChild(manualAddProduct);
	manualAddProduct.innerText = '구두발주';
	manualAddProduct.addEventListener('click', function(){
		/* 구두발주 팝업 */
		const boxInfo =[[null, '가로', 'short', false], [null, '세로', 'short', false], [null, '수량', 'short', false]];
		let btnInfo = null;
		btnInfo = [[ null, 'confirmCheck triple', 'manualAddProduct("'+`${param[1]}`+'")', '등록'],
			[ null, 'confirmCheck triple', 'cancelFunc(this)', '취소']];
		popupContoller(boxInfo, btnInfo, this, [1.5, 1.6]);

		const options = [
			{'levCode': -1, 'levName': '정상'},
			{'levCode': 0, 'levName': '임대'},
		];
		const stockTypeSelect = createSelect('', options, 'inputBox short', '구분');

		const manulAddPopup = document.querySelector('#popupDialog');
		manulAddPopup.insertBefore(stockTypeSelect, document.querySelector('#popupDialog > div:nth-child(4)'))
		manulAddPopup.querySelectorAll('.confirmCheck').forEach(confirm=>{
			confirm.style.setProperty('width', '30%');
		})
		/* 구두발주 팝업 Input evt */
		const popupDialogInputs = document.querySelectorAll('#popupDialog > .inputBox');
		popupDialogInputs[0].value = inputs[3].value;
		popupDialogInputs[1].value = inputs[4].value;
		popupDialogInputs[2].focus();
		for(let [idx, input] of popupDialogInputs.entries()){
			console.log(input, idx);
			input.addEventListener('keyup', function(e){
				if(e.key == 'Enter') popupDialogInputs.item(idx+1)?.focus();
			})
		}

		document.querySelector('#popupDialog > select')
			.addEventListener('keydown', function(e){
				if(e.key == 'Enter') document.querySelector('#popupDialog > div:nth-child(5)').click();
			})
	})
}

/** 구두발주
 * @param param (String) 원지코드
 */
function manualAddProduct(...param){
	if(document.querySelector('#popupDialog').children[3].selectedOptions[0].innerText == '구분'){
		alert('재고 유형을 선택해주세요')
		return;
	}
	/* 상수 할당 */
    const ogCode = param[0],
		data = document.querySelector('#popupDialog'),
		width = setString(data.children[0].value),
		height = (data.children[1].value) ?setString(data.children[1].value) : '000',
		sizeCode = setString2(width)+setString2(height),
		qty = data.children[2].value,
		productCode = ogCode + sizeCode,
		size = `${width}*${height}`,
		// 원지명, 평량, 제지사명 필요
		stockInfo = cubeJsonData[1]['stock']['selectedGoods'],
		ogName = stockInfo['originalName'],
		grammage = stockInfo['weight'],
		paperMakerCode = stockInfo['paperMakerCode'],
		purchaseName = stockInfo['paperMakerName'],
		weight = (height != 0) ?weightCalculate(grammage, width, height, qty) :qty,
		packaging = (height != 0) ?'R' :'R/L',
		buyIdx = 0,
		displayCenterName = `구두-${data.children[3].selectedOptions[0].innerText}`,
		stockType = parseInt(data.children[3]?.value),
		state = data.children[3]?.selectedOptions[0].innerText,
		centerCode = 'ET00';
	/* 변수 할당 */
	let color = null, purchaseCode = null, warehousing = false,
		paperMakerName = stockInfo['paperMakerName'];

	switch(paperMakerName){
        case '무림P&P': paperMakerName = '피앤피'; break;
        case '무림페이퍼': paperMakerName = '페이퍼'; break;
        case '무림에스피': paperMakerName = '에스피'; break;
    }

	/* 제지사 */
    for(const paperMaker of cubeJsonData[0].cubeMasterKey.cubeMasterPM){
		if(paperMaker['paperMakerCode'] == stockInfo['paperMakerCode']){
			purchaseCode = paperMaker['paperMakerRegisterNumber'];
			break;
		}
    }

    tempSelectDatas['product'].push(
        {
            'ogCode': ogCode, 'sizeCode': sizeCode, 'qty': qty, 'centerName': displayCenterName,
            'centerCode': centerCode, 'originalName': ogName, 'paperMakerName': paperMakerName,
            'paperMakerCode': paperMakerCode, 'grammage': grammage, 'width': width, 'height': height,
            'weight': weight, 'purchaseCode': purchaseCode, 'purchaseName': purchaseName,
            'orderType': buyIdx, 'stockType': stockType, 'packaging': packaging, 'color': color,
            'mappingCode': '구두', 'warehousing': warehousing
        }
    );
    cubeJsonData[1]['orderListGrid'].push({
        'originalName': ogName, 'grammage': grammage, 'size': size,
        'qty': qty, 'centerCode': centerCode, 'state': state, 'weight': weight,
        'centerName': displayCenterName, 'originalCode': ogCode, 'productCode': productCode,
        'orderType': buyIdx, 'stockType': stockType, 'color': color, 'warehousing': warehousing
    });
    // 장바구니 추가
    addProductStock(true);
    cancelCheck('popupDialog');
    console.log(param);
}

/** 자사 재고 검색 콜백
 * @param  {JSON} 자사센터 재고 데이터  
 */
function centerStockCallBack(...param){
	/* empty Css Class Remove */
	document.querySelector('#inventorySinseungCenterZone').classList.remove('empty');
	document.querySelector('#inventorySinseungCenterZone').innerHTML = '';

	if(param[0].length != 0){
		/* [0] >> 을지 [1] >> 파주 */
		const stocksList = [{}, {}];
		param[0].forEach(stock=>{
		    stock['size'] = (stock['isCut'] == 0)
		    ?`${stock['productCode'].substr(8,4)}*${stock['productCode'].substr(12,4)}`
		    :`${setString(stock['isCut'].split('|')[1].substr(0,4))}*${setString(stock['isCut'].split('|')[1].substr(4))} (${stock['isCut'].split('|')[0]})`;
		    stock['centerCode'] = stock['cpRndccode'];
		    stock['paperMakerCode'] = stock['productCode'].substr(0, 2);
		    // stock['qty'] = parseFloat(stock['cpCount']) + parseFloat(stock['scheduleQty']);
			stock['qty'] = parseFloat(stock['cpCount']).toFixed(3)
		    stock['grammage'] = stock['productCode'].substr(5, 3);
		    stock['ogCode'] = stock['productCode'].substr(0, 8);
		    for(let paperMaker of cubeJsonData[0]['cubeMasterKey']['cubeMasterPM']){
		        if(paperMaker['paperMakerCode'] == stock['paperMakerCode']){
		            stock['paperMakerName'] = paperMaker['paperMakerName'];
					stock['paperMakerAlias'] = paperMaker['paperMakerImg'].split('.')[0];
					break;
				}
		    }

			const stocks = (stock['centerCode'] != 'SS12')? stocksList[0]: stocksList[1];
			if(stock['size'] in stocks) stocks[`${stock['size']}`].push(stock);
			else {
				stocks[`${stock['size']}`] = [];
				stocks[`${stock['size']}`].push(stock);
			}
		})
		const inventorySinseungCenterZone = document.getElementById('inventorySinseungCenterZone');
		inventorySinseungCenterZone.innerHTML = '';
		
		/* [0] >> 을지 [1] >> 파주 */
		const gridDivs = [createDIV(null, 'center'), createDIV(null, 'center')];
		const selectBtns = [
			createButton('button', '을지 물류 센터', 'searchPart'),
			createButton('button', '파주 물류 센터', 'searchPart')
		]
		const line = createDIV(null, 'line');
		inventorySinseungCenterZone.appendChild(line);
		selectBtns.forEach((selectBtn, idx)=>{
			line.appendChild(selectBtn);
			selectBtn.addEventListener('click', function(){
				this.classList.add('on');
				selectBtns.forEach(btn=>{if(btn != this) btn.classList.remove('on')})
				gridDivs.forEach((gridDiv, gidx)=>{
					(idx != gidx)?gridDiv.style.setProperty('display', 'none')
					:gridDiv.style.setProperty('display', 'flex');
				})
				if(gridDivs[idx].children[0].children[0] != undefined)
    				gridDivs[idx].children[0].children[0].click();
			})
		})
		gridDivs.forEach(gridDiv =>{inventorySinseungCenterZone.appendChild(gridDiv);});
		stocksList.forEach((stocks, idx)=>{
			const selectBox = createDIV(null, 'selectBox');
			gridDivs[idx].appendChild(selectBox);
			for (const [key, value] of Object.entries(stocks)) {
				const selectDiv = createDIV('', 'col title');
				selectBox.appendChild(selectDiv);
				selectDiv.innerText = setString(key.split('*')[0]) + ' X ' + setString(key.split('*')[1]) 
				const records =  createDIV('', 'records');
				gridDivs[idx].appendChild(records);
				selectDiv.addEventListener('click', function(){
					this.classList.add('on');
					for(const div of selectBox.querySelectorAll('.col')){
						if(div != this) div.classList.remove('on');
					}
					for(const record of gridDivs[idx].querySelectorAll('.records')){
						if(records != record) record.style.setProperty('display', 'none');
						else records.style.setProperty('display', 'flex')
					}
				})
				let className = 'colHeader';
				let cols = createDIV('', 'cols');
				records.appendChild(cols);
				let col1 = createDIV('', className);
				cols.appendChild(col1);
				col1.innerText = '상품명'
				col1.style.setProperty('width', '45%');
				let col2 = createDIV('', className);
				cols.appendChild(col2);
				col2.innerText = '가용재고';
				let col3 = createDIV('', className);
				cols.appendChild(col3);
				col3.innerText = '입고예정';
				let col4 = createDIV('', className);
				cols.appendChild(col4);
				col4.innerText = '보관재고';
				className = 'col'
				let nullClassName = 'col null'
				value.forEach((stock, i)=>{
					cols = createDIV('', 'cols');
					records.appendChild(cols);
					col1 = createDIV('', 'rowHeader');
					cols.appendChild(col1);
					col1.innerText = `[${stock['paperMakerAlias']}] ${stock['originalName']}`;
					col1.setAttribute('title', stock['paperMakerName']);
					col1.style.setProperty('width', '45%');
					col2 = createDIV('',( stock['qty']) ?className :nullClassName);
					cols.appendChild(col2);
					col2.innerText = stock['qty'];
					col2.addEventListener('click', ()=>{
						for(const paperMaker of cubeJsonData[0].cubeMasterKey.cubeMasterPM){
							if(paperMaker['paperMakerCode'] == 'SS'){
								tempSelectDatas['info']['buy'] = paperMaker;
								break;
							}
						}
						const centerName = (idx != 1) ?'신승-을지' :'신승-파주';
						cancelCheck('subDialog');
						quantityController(inventorySinseungCenterZone, stock, centerName, i, stock['ogCode']);
					})
					col3 = createDIV('', (stock['scheduleQty']) ?className :nullClassName);
					cols.appendChild(col3);
					col3.innerText = stock['scheduleQty'];
					col4 = createDIV('', (stock['rentalQty']) ?className :nullClassName);
					cols.appendChild(col4);
					col4.innerText = stock['rentalQty'];
					col4.addEventListener('click', ()=>{
//						stock['rentalPartners'].forEach(rentalPartner=>{
//							for(const paperMaker of cubeJsonData[0].cubeMasterKey.cubeMasterPM){
//								if(paperMaker['paperMakerCode'] == 'SS'){
//									tempSelectDatas['info']['buy'] = paperMaker;
//									break;
//								}
//							}
//							if(tempSelectDatas['info']['partner']['partnerCode'] == rentalPartner['partnerCode']){
//								const centerName = (idx != 1) ?'신승-을지' :'신승-파주';
//								cancelCheck('subDialog');
//								quantityController(inventorySinseungCenterZone, stock, centerName, i, stock['originalCode'], rentalPartner['qty']);
//							}
//						})
					})
				})
			}
		})
		selectBtns[0].click();
		if(gridDivs[0].children[0].children[0] != undefined)
    		gridDivs[0].children[0].children[0].click();
	}else{
		document.querySelector('#inventorySinseungCenterZone').classList.add('empty');
	}
}

/* 주문 수량 입력 폼 컨트롤러 */
function quantityController(obj, stocks, centerName, i, originalCode, centerQty){
	if(canvasBox.filter(canvas=>{if(canvas.id == 'om10') return canvas}).length == 0) return;
	const orderDialog = createDIV('subDialog', 'orderDialog', '');
	orderDialog.style.top =  (window.pageYOffset + event.target.getBoundingClientRect().bottom + 5) + 'px';
	orderDialog.style.left = (window.pageXOffset + obj.getBoundingClientRect().left + (obj.offsetWidth / 3)) +'px';
	//수량 입력 Box
	const reamBox = createInputBox('text', 'qty', '', '', 'qty');
	const sheetBox = createInputBox('text', 'qty', '', '', 'qty');
	// 확인 Btn
	const confirm = createDIV('', 'confirmCheck', null);
	confirm.innerText = '확인'
	confirm.addEventListener('click', ()=>{
		if(reamBox.value != '') {
			reamBox.value = parseFloat(reamBox.value) + parseFloat(sheetBox.value / 500);
		}else{
			reamBox.value = parseFloat(sheetBox.value / 500);
		}
	        confirmCheckCtl(reamBox, stocks, centerName, i, originalCode);
	})
	// 취소 Btn
	const cancel = createDIV('', 'confirmCheck', null);
	cancel.innerText = '취소'
	cancel.addEventListener('click', (e)=>{cancelCheck('subDialog');});
	orderDialog.appendChild(reamBox);
	orderDialog.appendChild(sheetBox);
	orderDialog.appendChild(confirm);
	orderDialog.appendChild(cancel);
	document.body.appendChild(orderDialog);
	reamBox.focus();
	let reamPlaceHolder = null;
	let sheetPlaceHolder = null;
	if(i != undefined){
		if(stocks['size'].length < 4) stocks['size'] += '*0000';
		reamPlaceHolder = (!centerQty) ?'QTY(Ream)' :`최대 : ${centerQty}`;
		sheetPlaceHolder = (!centerQty) ?'QTY(Sheet)' :`최대 : ${centerQty * 500}`;
		if(cubeJsonData[1]['stock']['purchaseStockList']){
            const ptCode = originalCode + setString2(stocks['size'].split('*')[0]) + setString2(stocks['size'].split('*')[1]);
            let paperMakerName = null, centerCode = null;
            switch(stocks['paperMakerName']){
                case '무림P&P': paperMakerName = '피앤피'; break;
                case '무림페이퍼': paperMakerName = '페이퍼'; break;
                case '무림에스피': paperMakerName = '에스피'; break;
                default: paperMakerName = centerName;
            }
            for(const paperMaker of cubeJsonData[0].cubeMasterKey.cubeMasterPM){
                if(paperMaker['paperMakerCode'] == cubeJsonData[1]['stock']['orderPm']){
                    for(const paperMakerCenter of paperMaker['paperMakerCenters']){
                        if(paperMakerCenter['centerName'].split('-')[1] == centerName){
                            centerCode = paperMakerCenter['centerCode'];
                        }
                    }
                }
            }
            cubeJsonData[1]['stock']['purchaseStockList'].forEach(purchase=>{
                if(tempSelectDatas['info']['partner']['partnerCode'] != purchase['phPrCode']
                    && ptCode == purchase['phPtCode']
                    && centerCode == purchase['phCtCode']){
                        const available = parseFloat(stocks['stockList'][i].split(' ')[1])
                        - parseFloat(purchase['phQty']);
                        stocks['stockList'][i] = `${stocks['stockList'][i].split(' ')[0]} ${available}`
                        console.log(stocks['stockList'][i].split(' ')[1]);
                    }
            })
		}
	}else{
		reamPlaceHolder = 'QTY(Ream)';
		sheetPlaceHolder = 'QTY(Sheet)';
	}
	reamBox.addEventListener('keyup', (e)=>{
		if(e.keyCode == 13) sheetBox.focus();
		else if(e.keyCode == 27) cancelCheck('subDialog');
	})

	sheetBox.addEventListener('keyup', (e)=>{
		if(e.keyCode == 13){
			if(reamBox.value != '') reamBox.value = parseFloat(reamBox.value) + parseFloat(sheetBox.value / 500);
			else reamBox.value = parseFloat(sheetBox.value / 500);
			confirmCheckCtl(reamBox, stocks, centerName, i, originalCode);
		}
		else if(e.keyCode == 27) cancelCheck('subDialog');
	});

	reamBox.setAttribute('placeHolder', reamPlaceHolder);
	sheetBox.setAttribute('placeHolder', sheetPlaceHolder);
}

//수량유효성 컨트롤러
function confirmCheckCtl(qtyBox, stocks, center, i, originalCode){
	if(i != undefined){
	    let result = null;
	    if(['HS', 'HA'].includes(cubeJsonData[1]['stock']['orderPm']) && stocks['packaging'] == 'R/L'){
	        result = isNumeric(qtyBox.value, stocks['filedValue'][i-1]['STOCKWGT'], stocks.qtyUnit);
	        const qty = (qtyBox.value / stocks['filedValue'][i-1]['STDWEIGHT']).toFixed(0);
	        if(qty == 0) {qtyBox.value = ''; qtyBox.setAttribute('placeholder', result); qtyBox.focus();}
	        else confirmCheck(qtyBox.value, stocks, center, i, originalCode);
	    }else{
            result = (center.split('-')[0] != '신승')
            ?isNumeric(qtyBox.value, stocks['stockList'][i].split(" ")[1], stocks.qtyUnit)
            :isNumeric(qtyBox.value, stocks['qty'], 0.001);
            if(isNaN(result)) {qtyBox.value = ''; qtyBox.setAttribute('placeholder', result); qtyBox.focus();}
            else confirmCheck(parseFloat(qtyBox.value), stocks, center, i, originalCode);
	    }
	}else confirmCheck(qtyBox.value, stocks, center);
}
/** 주문 수량 입력 콜백
 * Required
 * @param  {Int} 입력 수량
 * @param  {JSON} 재고 정보
 * @param  {String} 센터명
 * Optional
 * @param  {Int} param[1]['stockList'] 클릭한 index
 * @param  {String} 원지코드
 */
function confirmCheck(...param){
	let buyIdx = null, displayCenterName = null, state = null, purchaseCode = null,
	purchaseName = null, paperMakerCode = null, paperMakerName = null, ogCode = null, width = null,
	height = null, centerCode = null, ogName = null, grammage = null, size = null, weight = null,
	productCode = null, sizeCode = null, stockType = 1, warehousing = false;

	let qty = param[0];
	let stocks = param[1];
	let centerName = param[2];
	if(param[3] != undefined){
	    stockListIdx = param[3];
	    ogCode = param[4];
	    ogName = stocks['originalName'];
	    grammage = stocks['grammage'];
	    width = setString(stocks['size'].split('*')[0]);
	    height = setString(stocks['size'].split('*')[1]);
	    weight = weightCalculate(grammage, width, height, qty, (stocks) ?stocks :null);
	    size = `${width}*${height}`;
	    sizeCode = setString2(stocks.size.split('*')[0]) + setString2(stocks.size.split('*')[1]);
        paperMakerCode = stocks['paperMakerCode'];
        paperMakerName = stocks['paperMakerName'];
        productCode = (ogCode) ?ogCode + sizeCode :stocks['productCode'];
		if(centerName.split('-')[0] != '신승'){ // 제지사
			buyIdx = 0;
			state = stocks['stockList'][0];
    	    packaging = stocks['packaging'];
			// 수량 적용
			let addProduct = null, push = true;
			switch (cubeJsonData[1]['stock']['orderPm']){
			    case 'HS': case 'HA':
                    addProduct = stocks['filedValue'][stockListIdx-1];
			        if(stocks['packaging'] != 'R/L'){
                        addProduct['weight'] = weight;
                        addProduct['qty'] = qty;
			        }else{
	                    addProduct['qty'] = (param[0] / stocks['filedValue'][stockListIdx-1]['STDWEIGHT']).toFixed(0);
	                    qty = (param[0] / stocks['filedValue'][stockListIdx-1]['STDWEIGHT']).toFixed(0);
			            addProduct['weight'] = param[0];
			            weight = param[0];
			        }
			        break;
				case 'HK':
				    addProduct = stocks['filedValue'][stockListIdx-1]
				    cubeJsonData[1]['stock']['orderList'].forEach(item=>{
				        if(item['clickedCenter'] == addProduct['clickedCenter']
				        && item['itemCode'] == addProduct['itemCode']){
				            addProduct = item;
                            push = false;
				        }
				    })
                    if(centerName != '보관'){
                        addProduct['allWgtNm'] = `${centerName}물류`;
						if(stocks['packaging'] != 'R/L') {
							addProduct['normalReqQty'] = param[0];
							addProduct['normalReqWeight'] = weight;
						}else{
							addProduct['normalReqWeight'] = param[0];
						}
                    }else{
                        addProduct['allWgtNm'] = `${addProduct['clickedCenter']}물류`;
                        addProduct['storeReqQty'] = param[0];
                        addProduct['storeReqWeight'] = weight;
                    }
					break;
				case 'CN':
				    addProduct = stocks['filedValue'][0];
					addProduct['chulQty'] = qty;
					addProduct['chulWeight'] = weight;
					break;
				case 'HW':
					addProduct = stocks['filedValue'][stockListIdx-1];
					if(stocks['packaging'] != 'R/L'){
						addProduct['weight'] = weight;
						addProduct['qty'] = qty;
					}else{
						addProduct['weight'] = qty;
						addProduct['qty'] = 0;
					}
					break;
				default:
				    addProduct = stocks['filedValue'][stockListIdx-1];
					if(stocks['packaging'] != 'R/L'){
						addProduct['weight'] = weight;
						addProduct['qty'] = qty;
					}else{
						addProduct['weight'] = qty;
						addProduct['qty'] = qty;
					}
			}
			if(push) cubeJsonData[1]['stock']['orderList'].push(addProduct);
			switch(stocks['paperMakerName']){
			    case '무림P&P': paperMakerName = '피앤피'; break;
			    case '무림페이퍼': paperMakerName = '페이퍼'; break;
			    case '무림에스피': paperMakerName = '에스피'; break;
			}
            for(const paperMaker of cubeJsonData[0].cubeMasterKey.cubeMasterPM){
                for(const paperMakerCenter of paperMaker['paperMakerCenters']){
                    if(paperMakerCenter['centerName'] == `${paperMakerName}-${centerName}`){
                        displayCenterName = paperMakerCenter['centerName'];
                        centerCode = paperMakerCenter['centerCode'];
                        paperMakerCode = paperMaker['paperMakerCode'];
                        purchaseCode = paperMaker['paperMakerRegisterNumber'];
                        purchaseName = paperMaker['paperMakerName'];
                    }
                }
            }
            // 정상
            if(!['매입', '임대', '보관'].includes(stocks['stockList'][0])) stockType = -1
            else{
                cubeJsonData[1]['stock']['purchaseStockList'].forEach(purchaseStock=>{
                    if(tempSelectDatas['info']['partner']['partnerCode'] == purchaseStock['phPrCode'])
                        stockType = 0
                })
            }
		}else{ // 자사
			// TODO :: 정상 입고 예정?
			buyIdx = 1;
			state = '자사';
            displayCenterName = centerName;
			centerCode = stocks['centerCode'];
			purchaseCode = '1078152415';
			purchaseName = '(주)신승아이엔씨';
			if(param[0] >= parseFloat(param[1]['cpCount']))
                warehousing = true;

//			stocks['rentalPartners'].forEach(rentalPartner=>{
//			    if(tempSelectDatas['info']['partner']['partnerCode'] == rentalPartner['partnerCode'])
//			        stockType = 0;
//			})
			packaging = 'R';
		}
	}else{
        /** 지업사
         * @param  {Int} 입력 수량
         * @param  {JSON} 상품 MasterKey
         * @param  {String} 거래처 MasterKey (centerName)
         */
		buyIdx = 2;
		state = '지업사';
		qty = param[0];
		ogCode = param[1]['originalCode'];
		ogName = param[1]['originalName'];
		grammage = param[1]['weight'];
		const sizeInput = document.querySelectorAll('#inventorySearchCondition .line_2');
		width = sizeInput[0].value;
		height = sizeInput[1].value;
	    weight = weightCalculate(grammage, width, height, qty, (stocks) ?stocks :null);
		size = `${width}*${height}`;
		sizeCode = setString2(width) + setString2(height);
		productCode = param[1]['originalCode'] + size.replace('*', '');
		purchaseCode = centerName['partnerCode'];
		purchaseName = centerName['partnerName'];
		paperMakerName = param[1]['paperMakerName'];
		paperMakerCode = param[1]['paperMakerCode'];
		centerName = '지업사'; displayCenterName = '지업사';
		centerCode = 'ET00';
		stockType = -1;
		packaging = 'R';
	}
	const color = cubeJsonData[1]['color'];
    tempSelectDatas['product'].push(
        {
            'ogCode': ogCode, 'sizeCode': sizeCode, 'qty': qty, 'centerName': centerName,
            'centerCode': centerCode, 'originalName': ogName, 'paperMakerName': paperMakerName,
            'paperMakerCode': paperMakerCode, 'grammage': grammage, 'width': width, 'height': height,
            'weight': weight, 'purchaseCode': purchaseCode, 'purchaseName': purchaseName,
            'orderType': buyIdx, 'stockType': stockType, 'packaging': packaging, 'color': color,
            'warehousing': warehousing
        }
    );
    cubeJsonData[1]['orderListGrid'].push({
        'originalName': ogName, 'grammage': grammage, 'size': size,
        'qty': qty, 'centerCode': centerCode, 'state': state, 'weight': weight,
        'centerName': displayCenterName, 'originalCode': ogCode, 'productCode': productCode,
        'orderType': buyIdx, 'stockType': stockType, 'color': color
    });
	// 장바구니 추가
	addProductStock(true);
	cancelCheck('subDialog');
}

function cancelCheck(obj){
	if(document.getElementById(obj) != null) (document.getElementById(obj)).remove();
}

/** 퀵서치 상품 추가 
 * @param  {Boolean} True >> 추가 False >> 종료 
 * @param  {JSON} 상품정보 
 */
function addProductStock(...param){
	const quickSearch = document.getElementById('quickSearch');
	quickSearch.style.setProperty('top', '10px');
	quickSearch.style.setProperty('transform', 'translate(-50%, 10px)');
	quickSearch.style.setProperty('transition', 'all 0.5s ease-in-out 0s');

	const orderListBoard = document.getElementById('orderListBoard');
	orderListBoard.style.setProperty('transition', 'all .7s ease-in-out');
	orderListBoard.style.setProperty('display', !param[0] ?'none' :'flex');
	orderListBoard.style.setProperty('top', param[0]? 'calc(100vh - var(--drawer-height) - 470px)': 'calc(100vh - 25px)');
	orderListBoard.style.setProperty('height', param[0]? '475px':'0px')
	orderListBoard.style.setProperty('border-width', param[0]? '3px':'0px');
	orderListBoard.children[0].style.setProperty('flex-direction', 'column');

	if(!param[0]) {
		orderListBoard.children[0].innerHTML = '';
		orderListBoard.children[1].innerHTML = '';
		quickSearch.style.setProperty('top', '50%');
		quickSearch.style.setProperty('left', '50%');
		quickSearch.style.setProperty('transform', 'translate(-50%, -50%)');
		quickSearch.style.removeProperty('transition');
	}
	if(orderListBoard.children[1].childElementCount == 0){
		const orderListInputDiv = createDIV('', 'line');
		orderListBoard.children[1].appendChild(orderListInputDiv);
        const orderListInputList = [
            createInputBox('text', '', '', '납품처(제지사)', 'searchPart'),
            createInputBox('text', '', '', '원발주처(제지사)', 'searchPart')
        ];
		if(!document.querySelector('#quickSearch > .titleZone > .title.header > .toggleBox').firstChild.checked){
            if(cubeJsonData[1]['stock']['orderPm'] == 'HK') orderListInputList.push(createInputBox('text', '', '', '신규도착장소', 'searchPart'));
            orderListInputList.forEach(input=>{orderListInputDiv.appendChild(input);})
            orderListInputList[0].addEventListener('keydown', (e)=>{
                switch (e.key){
                    case "Enter":
                        const formData = new FormData();
                        formData.append('keyWord', e.target.value);
                        formData.append('pmCode', cubeJsonData[1]['stock']['orderPm']);
                        serverCallByFetchAfterAuth(formData, '/DELIVERPLACESEARCH', 'post', 'deliverPlaceSearchCallBack');
                        break;
                    case "ArrowUp":
                        deliveryPlaceIdx = Math.max(deliveryPlaceIdx - 1, 0);
                        deliveryPlaceOnclick(cubeJsonData[1]['deliveryPlaceList'][deliveryPlaceIdx]);
                        break;
                    case "ArrowDown":
                        deliveryPlaceIdx = Math.min(deliveryPlaceIdx + 1, cubeJsonData[1]['deliveryPlaceList'].length - 1);
                        deliveryPlaceOnclick(cubeJsonData[1]['deliveryPlaceList'][deliveryPlaceIdx]);
                        break;
                    default:
                        deliveryPlaceIdx = 0;
                }
            })
		}
		const panel = createDIV('', 'panel');
		const functionDiv = document.querySelector('#orderListBoard .function');
		functionDiv.appendChild(panel)
		panel.appendChild(createDIV());

        const sumLayer = createDIV('', 'paperMakerSum');
        functionDiv.appendChild(sumLayer);
        let sumQty = 0, sumWeight = 0;
        tempSelectDatas['product'].forEach((data, i)=>{
            sumQty += parseFloat(data['qty']); sumWeight += parseFloat(data['weight']);
        })
        sumLayer.innerText = `총 수량: ${sumQty}  총 중량 : ${sumWeight}`;
		const requestDiv = createDIV('paperMakerOrder');
		functionDiv.appendChild(requestDiv);

		let today = '';
		let dateValue = new Date();
		let year = dateValue.getFullYear();
		let month = ('0' + (1 + dateValue.getMonth())).slice(-2);
		let day = ('0' + dateValue.getDate()).slice(-2);
		today = year + '-' + month + '-' + day;

		const date = createInputBox('date', 'date', '', '일', 'searchPart');
		date.value = document.querySelector('#inventorySearchCondition > div:nth-child(2) > input:nth-child(4)')?.value;
		requestDiv.appendChild(date);
		date.style.setProperty('width', '35%');
		const time = createInputBox('text', 'time', '', '시', 'searchPart');
		requestDiv.appendChild(time);
		time.value = (dateValue.getMinutes() > 30) ? dateValue.getHours() + 2 : dateValue.getHours() + 1;
		time.style.setProperty('width', '20%')
		time.style.setProperty('padding-left', '0')

		const requestBtn = createButton('button', '출하요청', 'searchPart btn');
		requestDiv.appendChild(requestBtn);
		requestBtn.style.setProperty('width', '35%');
		requestBtn.style.setProperty('padding', '0');
		requestBtn.addEventListener('click',()=>{
			if(confirm('출하 요청하시겠습니까?')){
                tempSelectDatas['info']['wnDate'] = date.value;
                tempSelectDatas['info']['wnTime'] = time.value;
                if(cubeJsonData[1]['stock']['orderList'].length != 0){
                    if(requestBtn.dataset['wait'] == 1) return;
					if(cubeJsonData[1]['stock']['deliveryPlace'] == null){
						alert('제지사 납품처를 선택해주세요');
						return;
					}
                    const formData = new FormData();
                    // 비고
                    let orderPm = null;
                    switch(cubeJsonData[1]['stock']['orderPm']){
                        case 'MR': case 'MP': case 'MS':
                        orderPm = 'MR';
                        break;
                        case 'HS': case 'HA': case 'HP':
                        orderPm = 'HS';
                        break;
                        default: orderPm = cubeJsonData[1]['stock']['orderPm'];
                    }
                    const rmrkList = document.querySelectorAll('#orderListBoard textarea');
                    if(cubeJsonData[1]['stock']['orderPm'] == 'HK') formData.append('HK[0].headerRemark', orderListInputList[2].value);
                    formData.append('buComment', orderListInputList[1].value); // 원발주처
                    // CUBE Table :: buy
                    const stack = document.querySelectorAll('#orderListBoard select');
                    tempSelectDatas['product'].forEach((data, i)=>{
                        if(data['orderType'] == 0){
                            // CUBE Table :: buyDetail
                            formData.append('buyDetail[' + i + '].productCode', data['ogCode'] + data['sizeCode']);
                            formData.append('buyDetail[' + i + '].quantity', data['qty']);
                            formData.append('buyDetail[' + i + '].weight', data['weight']);
                            formData.append('buyDetail[' + i + '].purchaseCode', data['purchaseCode']);
                            formData.append('buyDetail[' + i + '].centerCode', data['centerCode']);
                            // 한솔 적송처리
                            if(stack.length != 0 ){
                                if(stack[i].value != '적송')
                                cubeJsonData[1]['stock']['orderList'][i]['LGORT_TO'] = stack[i].value;
                            }
                        }
                    })
                    // 제지사 코드
                    formData.append('pmCode', orderPm);
                    formData.append('date', date.value);
                    formData.append('time', time.value);
                    // 납품처 정보
                    formData.append('code', cubeJsonData[1]['stock']['deliveryPlace'].code);
                    formData.append('name', cubeJsonData[1]['stock']['deliveryPlace'].name);
                    formData.append('address', cubeJsonData[1]['stock']['deliveryPlace'].address);
                    formData.append('phone', cubeJsonData[1]['stock']['deliveryPlace'].phone);
                    formData.append('phone2', cubeJsonData[1]['stock']['deliveryPlace'].phone2);
                    formData.append('etc', cubeJsonData[1]['stock']['deliveryPlace'].etc);
                    // 제지사 request filedValue
                    cubeJsonData[1]['stock']['orderList'].forEach((order, i)=>{
                        formData.append(orderPm + '[' + i + '].rmrk', rmrkList[i].value);
                        for(const [key, value] of Object.entries(order)){
                            formData.append(orderPm+'['+ i +'].' + key, value);
                        }
                    })
                    for (let key of formData.keys()) {
                        console.log(key, ":", formData.get(key));
                    }
					requestBtn.setAttribute('data-wait', 1);
					serverCallByFetchAfterAuth(formData, '/PAPERMAKERORDER', 'POST', 'paperMakerOrderCallBack');
					// paperMakerOrderCallBackTest();
                }else{
                    displayOrderList();
                    callQuickSearch();
                }
			}else alert('취소');
		})
	}
	renderOrderList();
}

function renderOrderList(){
	const orderListBoard = document.getElementById('orderListBoard');
	const columns = 
		[
			['상품명', 'originalName', '34%', 'left'],
			['센터', 'centerName', '20%', 'center'],
			['평량', 'grammage', '7%', 'center'],
			['사이즈', 'size', '17%', 'center'],
			['수량', 'qty', '10%', 'center'],
			['중량', 'weight', '12%', 'center'],
			[
				[],
				],
				['']
			];

	makeCubeGridInWorkBoard(orderListBoard.children[1], columns, 'orderListGrid', true, true);
	const rows = document.querySelectorAll('#orderListBoard > div.function > div > div > div.records > div');
	const records = document.querySelector('#orderListBoard > div.function > div > div > div.records');
	rows.forEach((row, idx)=>{
		const recordFrame = createDIV('', 'recordFrame', '');
		recordFrame.appendChild(createTextArea('', 'searchPart text', '비고(제지사)'));
		if(['HS', 'HA'].includes(cubeJsonData[1]['stock']['orderPm'])){
			const options = [
				{'levCode': '6150', 'levName': '부천'},
				{'levCode': '6700', 'levName': '파주'},
				{'levCode': '6100', 'levName': '서빙고'},
			];
			recordFrame.appendChild(createSelect('LGORT_TO', options, 'searchPart', '적송'));
			recordFrame.children[0].style.setProperty('width', '80%');
			recordFrame.children[1].style.setProperty('width', '20%');
		}
		const del = createDIV('', 'del', '');
		del.innerText = 'X';
		del.addEventListener('click', ()=>{
		    console.log(row);
			removeOrderList(idx)
		});
		recordFrame.appendChild(del);
		records.insertBefore(recordFrame, row.nextSibling);
	});
	if(!document.querySelector('#quickSearch > .titleZone > .title.header > .toggleBox').firstChild.checked)
    	document.querySelector('#orderListBoard > div.function > div.line > input:nth-child(1)').focus();
    const sumLayer = document.querySelector('#orderListBoard > div.function > div.paperMakerSum');
    let sumQty = 0, sumWeight = 0;
    tempSelectDatas['product'].forEach((data, i)=>{
        sumQty += data['qty']; sumWeight += data['weight'];
    })
    sumLayer.innerText = `총 수량: ${sumQty}  총 중량 : ${sumWeight}`;
}

function removeOrderList(idx){
    tempSelectDatas['product'].splice(idx, 1);
	cubeJsonData[1]['stock']['orderList'].splice(idx, 1);
	cubeJsonData[1]['orderListGrid'].splice(idx, 1);
	renderOrderList();
}

function deliverPlaceSearchCallBack(...param){
    if(param[0].length != 0){
        cubeJsonData[1]['deliveryPlaceList'] = param[0];
        cubeJsonData[1]['deliveryPlaceList'].map(delivery=>{
            if(delivery.address.length > 15) delivery.addressS = delivery.address.substring(0, 15);
            else delivery.addressS = delivery.address;
            if(delivery.name.length > 13) delivery.nameE = delivery.name.substring(0, 13);
            else delivery.nameE = delivery.name
            if(cubeJsonData[1]['stock']['orderPm'] == 'HW')
            delivery.phone = (delivery.phone.split('/').length != 0) ?delivery.phone.split('/')[0] :delivery.phone.split('.')[0];
        })
        const columns =
            [
                ['납품처', 'nameE', '35%', 'left'],
                ['번호', 'phone', '25%', 'center'],
                ['주소', 'addressS', '40%', 'left'],
                [
                    ['제지사코드', 'code', '100%',  'center'],
                    ],
                    ['deliveryPlaceOnclick']
                ];
        const profile = document.querySelector('#orderListBoard .profile');

        if(!document.querySelector('#orderListBoard .profile .panel')){
            let panel = createDIV('', 'panel');
            profile.appendChild(createDIV());
            profile.appendChild(panel);
            panel.appendChild(createDIV());
        }

        sortJSON(cubeJsonData[1]['deliveryPlaceList'], columns[0][1], true);
        makeCubeGridInWorkBoard(profile, columns, 'deliveryPlaceList', true, true);
    }
}

function deliveryPlaceOnclick(...param){
	const rows = document.querySelectorAll('#orderListBoard .row');
	for(let i=0; i<rows.length; i++){
		if(i != cubeJsonData[1]['deliveryPlaceList'].indexOf(param[0])) rows[i].classList.remove('on');
		else rows[i].classList.toggle('on');
	}
    tempSelectDatas['info']['deliveryPlace'] = param[0];
	cubeJsonData[1]['stock']['deliveryPlace'] = param[0];
	document.querySelector('#orderListBoard .function input').value = param[0].name;
}

function paperMakerOrderCallBack(...param){
    document.querySelector('#paperMakerOrder > input.searchPart.btn').dataset['wait'] = 0;
	const msg = (param[0][1])? '0-주문성공' :'1-주문실패';
	/*			insertType
                    0 >> 자사 매입 (발주, 입고)
                    1 >> 매입 직송 (발주)
                    2 >> 자사 입고 후 출고 (발주, 입고, 출고)
                    3 >> 자사 출고 (출고)
                    4 >> 자사 이관 (입고, 이관, 출고)
                    5 >> 자사 이관 후 출고 (입고, 이관, 출고, 출고)
    			stockType
    			    -1 >>> 정상,주문, 공용
    				0  >>> 매출 보관 잡은 거래처의 주문
    				1  >>> 매출 보관 없는 거래처의 주문
    			orderType
    				0 >> 매입 제지사 재고 (insertType)
    				1 >> 매출 자사 재고 (주문, 출고)
    				2 >> 지업사 지업사 주문 (insertType)
    */
	messageBoardCall(`${msg.split('-')[0]}:주문결과:${msg.split('-')[1]}:확인`);
	param[0][0]['buyDetail'].forEach((bean, idx)=>{
	    for(let i=0; i<tempSelectDatas['product'].length; i++){
	        if(tempSelectDatas['product'][i]['orderType'] == 0 && tempSelectDatas['product'][i]['mappingCode'] == undefined){
	            tempSelectDatas['product'][i]['mappingCode'] = bean['mappingCode'];
	            break;
	        }
	    }
    })
    if(param[0][1]){
        cubeJsonData[1]['stock'] = [];
        cubeJsonData[1]['deliveryPlaceList'] = [];
        cubeJsonData[1]['orderListGrid'] = [];
        cubeJsonData[1]['stock']['orderList'] = [];
        // tempSelectDatas['orderList'] = structuredClone(tempSelectDatas['product']);
        // tempSelectDatas['orderList'].forEach((data, idx)=>{
        //     data['parentIdx'] = idx;
        // })
        displayOrderList();
        callQuickSearch();
    }
}

function paperMakerOrderCallBackTest(...param){
    document.querySelector('#paperMakerOrder > input.searchPart.btn').dataset['wait'] = 0;
    cubeJsonData[1]['stock'] = [];
    cubeJsonData[1]['deliveryPlaceList'] = [];
    cubeJsonData[1]['orderListGrid'] = [];
    cubeJsonData[1]['stock']['orderList'] = [];
    // tempSelectDatas['orderList'] = structuredClone(tempSelectDatas['product']);
    displayOrderList();
    callQuickSearch();
}

/* 사업자번호 출력 포맷 */
function setBusinessRegNumber(reg){
	return reg.substr(0, 3) + '-' + reg.substr(3, 2) + '-' + reg.substr(5, 5);
}

/* 전화번호 출력 포맷 */
function setFormatPhoneNumber(phone){
	let formattedPhoneNumber = phone;
	if(phone != 'NO-DATA'){
	    if(phone.length > 8 && !phone.includes('-')) {
	        if(phone.substr(0, 2) == '00'){
                if(phone.substr(3).length != 8)
                    formattedPhoneNumber = phone.substr(1,2) + '-' + phone.substr(2,3) + '-' + phone.substr(5,4);
                else
                    formattedPhoneNumber = phone.substr(1,2) + '-' + phone.substr(2,4) + '-' + phone.substr(6,4);
            }else if(phone.substr(1,1) == 2){
                if(phone.substr(2).length != 8)
                    formattedPhoneNumber = '02-' + phone.substr(2,3) + '-' + phone.substr(5,4);
                else
                    formattedPhoneNumber = '02-' + phone.substr(2,4) + '-' + phone.substr(6,4);
            }else if(phone.substr(0,1) != '0'){
                formattedPhoneNumber = '0' + phone.substr(0,2) + '-' + phone.substr(2,4) + '-' + phone.substr(6,4);
            }else{
                if(phone.substr(3).length != 8)
                    formattedPhoneNumber = phone.substr(0,3) + '-' + phone.substr(3,3) + '-' + phone.substr(6,4);
                else
                    formattedPhoneNumber = phone.substr(0,3) + '-' + phone.substr(3,4) + '-' + phone.substr(7,4);
            }
		}else{
				// if(phone.length != 8)
				// 	formattedPhoneNumber = '02' + '-' + phone.substr(0,3) + '-' + phone.substr(3,4);
				// else
				// 	formattedPhoneNumber = '02' + '-' + phone.substr(0,4) + '-' + phone.substr(4,4);
		    switch (phone.length){
		        case 7:
		            formattedPhoneNumber = '02' + '-' + phone.substr(0,3) + '-' + phone.substr(3,4);
                    break;
		        case 8:
                    formattedPhoneNumber = '02' + '-' + phone.substr(0,4) + '-' + phone.substr(4,4);
		            break;
		    }
		}
	}
	
	return formattedPhoneNumber;
}

/* Dynamic Script Loading : General */
function loadSriptSource(initFunc, canvasIdx, source){
	const script = document.createElement('script');
	script.onload = function() {
		console.log(source + ' Script File loading complete');
		if(initFunc != null) window[initFunc](canvasIdx);
	};

	script.src = source; 
	document.getElementsByTagName('head')[0].appendChild(script);

}

/* 수량 유효성 검사 */
function isNumeric(value, maxLimit, multiple){
	let result = ' 확인';
	if(!isNaN(value)){
		const param = [parseFloat(value), parseFloat(maxLimit.replace(",", "")), parseFloat(multiple)];
		if(param[0] > 0 && param[0] <= param[1]) if(Math.floor((param[0] * 1000).toFixed() % (param[2] * 1000).toFixed()) == 0) result = param[0];
	}else result = '숫자 입력';
	
	return result;
}

/* 중량 자동 계산 */
function weightCalculate(gsm, width, height, ream, stockBean){
	let reamPerWeight = null;
	let weight = null;
	if(stockBean != undefined && stockBean['filedValue'] != undefined){
        switch (cubeJsonData[1]['stock']['orderPm']){
            case 'HS': case 'HA':
                weight = Math.round(parseFloat(stockBean['filedValue'][0]['STDWEIGHT']) * ream); break;
            case 'HK':
                reamPerWeight = Math.round((gsm/1000) * (width/1000) * (height/1000) * 500 * 10) / 10;
                weight = reamPerWeight * ream;
                break;
            case 'HW': weight = Math.round((( gsm / 1000 ) * ( width / 1000) * (height / 1000)) * 500 * ream); break;
            case 'CN': weight = Math.round(stockBean['filedValue'][0]['unit'] * ream); break;
            default:
                reamPerWeight = Math.round((gsm/1000) * (width/1000) * (height/1000) * 500);
                weight = Math.round(reamPerWeight * ream);
        }
	}else{
        reamPerWeight = (gsm/1000) * (width/1000) * (height/1000) * 500;
        weight = Math.round(reamPerWeight * ream);
	}
	return weight;
}

/* 수량 자동 계산(매 -> 연) */
function reamCalculate(value){
	const ream = Math.floor(value / 500);
	const sheet = value % 500;
	const total = ((ream != 0)? ream + 'R ' : '') + ((sheet != 0 )? Math.abs(sheet) + 'S' : '');
	
	return total;
}

/* 수량 자동 계산(연 -> 매) */
function sheetCalculate(value){
	const separation = [ Math.floor(value), Math.ceil(((parseFloat(value).toFixed(3) - Math.floor(value)) * 500).toFixed(3))];
	const conversionQty = '<span class=\'big\'>' + separation[0] + '</span>R ' + ((separation[1] > 0)? '<span class=\'big\'>' + separation[1] + '</span>S' : '');  
	return conversionQty;
}

/* 거래처의 특정 업무 담당자 이름 가져오기 
 * @param	{String}	거래처코드
 * @param	{String}	업무코드 || 업무명
 * @returns	{String}	담당자명
 * */
function getPartnerJobInfo(...param){
	const workInfo = cubeJsonData[0]['cubeMasterKey']['cubeMasterPEW'];
	const isCode = param[1].startsWith('J')? true: false;
	let empName = null;

	for(let idx = 0; idx < workInfo.length; idx++) {
		if(param[0] == workInfo[idx]['partnerCode']){
			empName = workInfo[idx]['peName'];
			if(param[1] == (isCode? workInfo[idx]['jobCode'] : workInfo[idx]['jobName'])){
				empName = workInfo[idx]['peName'];
				break;
			} 
		}
	}
	
	return empName;
}

/* 거래처의 특정 사원의 정보 가져오기 
 * @param	{String}	거래처코드
 * @param	{String}	담당자명
 * @returns	{JSON}		cubeMasterKey[cubeMasterPEA] Record
 * */
function getPartnerEmpInfo(...param){
	const empInfo = cubeJsonData[0]['cubeMasterKey']['cubeMasterPEA'];
	let employee = null;
	
	for(let idx = 0; idx < empInfo.length; idx++){
		if(param[0] == empInfo[idx]['partnerCode'] && param[1] == empInfo[idx]['peName']){
			employee =  empInfo[idx];
			break;
		}
	}
	
	return employee;
}

/* 파트별 거래처 담당자 
 * @param	{String}	거래처코드
 * @returns	{JSON}		cubeMasterKey[cubeMasterEP] Record	
 * */
function getWorkManager(...param){
	const workManager = cubeJsonData[0]['cubeMasterKey']['cubeMasterEP'];
	let info = null;
	
	for(let idx = 0; idx < workManager.length; idx++){
		if(param[0] == workManager[idx]['partnerCode']){
			info =  workManager[idx];
			break;
		}
	}
	
	return info;
}


/**additionalFeatures On Badge
 * : WorkBoard의 추가 기능 수행 HTML Object
 * @param {badge : string}					Object가 표현될 Layer
 * @param {funcName : string}				Click 이벤트 발생시 CallBack Function
 * @param {spec : [가로, 세로, 표시항목]}
 * @param {cls : string}					적용할 클래스명
 */
function additionalFeatures(badge, funcName, spec, cls, index){
	const layer = createDIV(null, 'addBtn ' + cls, funcName);
	if(spec != null){
		layer.style.setProperty('width', spec[0]);
		layer.style.setProperty('height', spec[1]);
	}
	if(funcName != null){
		layer.addEventListener('click', () => {
			if(index != null && index != '') window[funcName](index);
			else window[funcName]();
		});
	}
	badge.appendChild(layer);
}

/**popupController
 * : 팝업입력폼
 * @boxInfo
 * @btnInfo
 * @obj
 * @rate
 * */
function popupContoller(boxInfo, btnInfo, obj, rate){
	const popup = document.querySelector('#popupDialog');
	if(popup != null) popup.remove();
	
	const commonDialog = createDIV('popupDialog', 'orderDialog', '');
	commonDialog.style.width = 'calc(((25% / 3  * 2 ) - 10px) * '+ rate[0] + ')';
	commonDialog.style.height = 'calc(45px * ' + rate[1] + ')';
	commonDialog.style.top =  (window.pageYOffset + obj.getBoundingClientRect().bottom + 5) + 'px';
	commonDialog.style.left = (window.pageXOffset + obj.getBoundingClientRect().left) +'px';
	
	//inputBox 출력, 수정 Box
	const inputBox = [];
	boxInfo.forEach((box) => {
		const obj = createInputBox('text', '', box[0], box[1], 'inputBox ' + box[2]);
		if(box[3]) {
		    obj.setAttribute('readOnly', box[3]);
			obj.addEventListener('dblclick', () => {
				obj.removeAttribute('readOnly');
				obj.parentElement.children[(boxInfo.length - 1) + 2].innerText = '수정';
				obj.parentElement.children[(boxInfo.length - 1) + 1].style.setProperty('display', 'none');
				obj.select();
			});
		}
		commonDialog.appendChild(obj); 
	});
	
	const commandBtns = [];
	btnInfo.forEach((btn, idx) => {
	    let commandBtn = null;
	    if(btn[2].split('|').length != 1){
            commandBtn = createDIV(btn[0], btn[1]);
            if(btn[2].split('|').length > 1){
                commandBtn.addEventListener('click', function(e){
					console.log(this);
                    if(this.innerText == '수정'){
                        window[btn[2].split('|')[1].split("(")[0]](btn[2].split('|')[1].split("'")[1])
                    }else if(commandBtns.length > 2){
						window[btn[2].split('|')[0].split("(")[0]](btn[2].split('|')[0].split("'")[1])
                    }else{
                       cancelFunc(this);
					}
                })
            }else{
                commandBtn.addEventListener('click', ()=>{
                    window[btn[2].split("(")[0]](btn[2].split("'")[1]);
                })
            }
	    }else commandBtn = createDIV(btn[0], btn[1], btn[2]);
		commandBtns.push(commandBtn);
		commandBtns[idx].innerText = btn[3];
		commonDialog.appendChild(commandBtns[idx]);
	});
		
	document.body.appendChild(commonDialog);
}

/**주문 일일 마감
 * : 마감 화면 호출
 * @boxInfo
 * @btnInfo
 * @obj
 * @rate
 * */
function callOrderDayEnd(){
//	const canvasSpec = [
//					'마감',
//					['1/1/2/4','1/4/2/6','2/1/11/7','1/6/2/7'],
//					'cl30',
//					['resources/js/cl30.js'],
//				  ];
//	
//	if(!document.getElementById('cl30')){
//		/* Work Space Creation */
//		const workSpace = createDIV('', 'workSpace', '');
//		workSpace.setAttribute('id', canvasSpec[2]);
//		workSpace.setAttribute('data-name', canvasSpec[0]);  
//		workSpace.style.setProperty('display', 'grid');
//		
//		const canvas = document.getElementById('cubeCanvas');
//		const script = document.createElement('script');
//		script.src = canvasSpec[3];
//		document.getElementsByTagName('head')[0].appendChild(script);
//		
//		/* Work Board 생성 요청 --> workSpace.appendChild */
//		const boardSpec = canvasSpec[1];
//		if (boardSpec != null && boardSpec.length > 0) {
//			const board = [];
//			for (let boardIdx = 0; boardIdx < boardSpec.length; boardIdx++) {
//				const workBoard = createBoard(['workBoard', boardSpec[boardIdx]]);
//				workBoard.style.setProperty('visibility', 'visible');
//	            
//				/* WorkSpace에 추가 */
//				workSpace.appendChild(workBoard);
//			}
//		}
//		canvasBox.push(workSpace);
//		canvas.appendChild(canvasBox[canvasBox.length-1]);
//		loadSriptSource('cl30Init', '99', 'resources/js/cl30.js');
//		return canvasBox.length-1;
//	}
}

/* 주문서 내 Element 동적 생성 */
function appendBadge(frame, spec){
	spec.forEach((data) => {
		const item = createDIV(null, 'item ' + data, null);
		frame.appendChild(item);
	});
	return frame;
}

let orderManagementCall = false;

class Utils {
	/** @type {utils.Utils['rlStCode']} */
  static rlStCode = {
    R00: '수량수정',
    R01: '입고 후 출고예정',
    R02: '출고예정',
    R03: '출고진행',
    R04: '출고완료',
    R05: '납품완료'
  };

	/** @type {utils.Utils['empty']} */
	static empty(arg) {
		let result = [undefined, null, 0, ''].includes(arg);

		if (!result) {
			if (Array.isArray(arg)) {
				result = (arg.length == 0);
			} else if (typeof arg == 'object') {
				result = ((Object.keys(arg).length == 0) && (Object.keys(Object.getPrototypeOf(arg)).length == 0));
			}
		}

		return result;
	}

	/** @type {utils.Utils['isNumber']} */
	static isNumber(arg, strict = false) {
		let result = (!Number.isNaN(Number(arg)) && ['number', 'string'].includes(typeof arg) && (!/^\s*$/.test(arg)));

		if (result && strict) {
			result = (typeof arg == 'number');
		}

		return result;
	}

	/** @type {utils.Utils['isObject']} */
	static isObject(arg) {
		return ((typeof arg == 'object') && !Array.isArray(arg));
	}

	/** @type {utils.Utils['numberFormat']} */
	static numberFormat(num, decimals = 0, decimal_separator = '.', thousands_separator = ',') {
		let result = String(num).split('.');

		result[0] = result[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_separator);

		if (!this.empty(result[1])) {
			result[1] = result[1].substring(0, decimals);
		}

		return (!this.empty(result[1])) ? result[0].concat(decimal_separator, result[1]) : result[0];
	}

	/** @type {utils.Utils['strftime']} */
	static strftime(date, format) {
		const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		format = format.replace(/(%{1})/g, '\\$1');
		format = format.replace(/(\\%) {2}/g, '%');
		format = format.replace(/\\%Y/g, String(date.getFullYear()));
		format = format.replace(/\\%y/g, String(date.getFullYear()).replace(/^\d+(\d{2})$/, '$1'));
		format = format.replace(/\\%B/g, month[date.getMonth()]);
		format = format.replace(/\\%b/g, month[date.getMonth()].replace(/^(\w{3})\w*$/, '$1'));
		format = format.replace(/\\%m/g, String(date.getMonth() + 1).replace(/^(\d{1})$/, '0$1'));
		format = format.replace(/\\%d/g, String(date.getDate()).replace(/^(\d{1})$/, '0$1'));
		format = format.replace(/\\%A/g, week[date.getDay()]);
		format = format.replace(/\\%a/g, week[date.getDay()].replace(/^(\w{3})\w*$/, '$1'));
		format = format.replace(/\\%H/g, String(date.getHours()).replace(/^(\d{1})$/, '0$1'));
		format = format.replace(/\\%I/g, String((date.getHours() > 12) ? (date.getHours() - 12) : date.getHours()).replace(/^0$/, '12').replace(/^(\d{1})$/, '0$1'));
		format = format.replace(/\\%p/g, (date.getHours() < 12) ? 'AM' : 'PM');
		format = format.replace(/\\%M/g, String(date.getMinutes()).replace(/^(\d{1})$/, '0$1'));
		format = format.replace(/\\%S/g, String(date.getSeconds()).replace(/^(\d{1})$/, '0$1'));

		return format;
	}

	/** @type {utils.Utils['checkdate']} */
	static checkdate(year, month, day) {
		const date = new Date(year, (month - 1), day);

		return ((date.getFullYear() == year) && ((date.getMonth() + 1) == month) && (date.getDate() == day));
	}

	/** @type {utils.Utils['equaldate']} */
	static equaldate(date_1, date_2 = new Date()) {
		return (this.strftime(date_1, '%Y-%m-%d') == this.strftime(date_2, '%Y-%m-%d'));
	}

	/** @type {utils.Utils['getWeek']} */
	static getWeek(date, flag = true) {
		const week = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
		result = week[date.getDay()];

		return (flag) ? result : result.replace(/^([ㄱ-ㅎㅏ-ㅣ가-힣]{1})[ㄱ-ㅎㅏ-ㅣ가-힣]+$/, '$1');
	}

	/** @type {utils.Utils['addDate']} */
	static addDate(date, interval) {
		return new Date(
			date.getFullYear() + (this.isNumber(interval.year, true) ? interval.year : 0),
			date.getMonth() + (this.isNumber(interval.month, true) ? interval.month : 0),
			date.getDate() + (this.isNumber(interval.day, true) ? interval.day : 0),
			date.getHours() + (this.isNumber(interval.hour, true) ? interval.hour : 0),
			date.getMinutes() + (this.isNumber(interval.minute, true) ? interval.minute : 0),
			date.getSeconds() + (this.isNumber(interval.second, true) ? interval.second : 0),
			date.getMilliseconds() + (this.isNumber(interval.millisecond, true) ? interval.millisecond : 0)
		);
	}

	/** @type {utils.Utils['subDate']} */
	static subDate(date, interval) {
		return new Date(
			date.getFullYear() - (this.isNumber(interval.year, true) ? interval.year : 0),
			date.getMonth() - (this.isNumber(interval.month, true) ? interval.month : 0),
			date.getDate() - (this.isNumber(interval.day, true) ? interval.day : 0),
			date.getHours() - (this.isNumber(interval.hour, true) ? interval.hour : 0),
			date.getMinutes() - (this.isNumber(interval.minute, true) ? interval.minute : 0),
			date.getSeconds() - (this.isNumber(interval.second, true) ? interval.second : 0),
			date.getMilliseconds() - (this.isNumber(interval.millisecond, true) ? interval.millisecond : 0)
		);
	}

	/** @type {utils.Utils['checkAll']} */
	static checkAll(node, name) {
		/** @type {NodeListOf<HTMLInputElement>} */
		const el_list = document.querySelectorAll(`input[type="checkbox"][data-name='${name}']`);

		el_list.forEach((el, i, arr) => {
			el.checked = node.checked;
		});
	}

	/** @type {utils.Utils['xor']} */
	static xor(arg_1, arg_2) {
		return (!(arg_1 && arg_2) && (arg_1 || arg_2));
	}

	/** @type {utils.Utils['setCookie']} */
	static setCookie(key, value, expire, path = '/', domain = location.hostname) {
		if (this.empty(expire)) {
			expire = new Date();

			expire.setDate(expire.getDate() + 1);
		}

		document.cookie = `${key}=${value}; expires=${expire.toUTCString()}; path=${path}; domain=${domain}`;
	}

	/** @type {utils.Utils['getCookie']} */
	static getCookie(key) {
		let result = document.cookie.split('; ').find((val, i , arr) => {
			return val.startsWith(key);
		});

		if (!this.empty(result)) {
			result = result.split('=')[1];
		} else {
			result = null;
		}

		return result;
	}

	/** @type {utils.Utils['popCookie']} */
	static popCookie(key, path = '/', domain = location.hostname) {
		const expire = new Date();

		expire.setDate(expire.getDate() - 1);

		document.cookie = `${key}=; expires=${expire.toUTCString()}; path=${path}; domain=${domain}`;
	}

	/** @type {utils.Utils['formDataToJson']} */
	static formDataToJson(form_data) {
		return JSON.stringify(Object.fromEntries([...new Set(form_data.keys())].map((key) => [key, (form_data.getAll(key).length > 1) ? form_data.getAll(key) : form_data.get(key)])));
	}

	/** @type {utils.Utils['percentage']} */
	static percentage(num, per) {
		return num * (per / 100);
	}

	/** @type {utils.Utils['ratio']} */
	static ratio(ratio, num, flag = true) {
		const index = flag
			? [1, 0]
			: [0, 1];

		return (num * ratio[index[0]]) / ratio[index[1]];
	}

	/** @type {utils.Utils['arithmeticSequence']} */
	static arithmeticSequence(a, x, d, n) {
		return a + ((n - x) * d);
	}

	/** @type {utils.Utils['geometricSequence']} */
	static geometricSequence(a, x, r, n) {
		return (a / (r ** (x - 1))) * (r ** (n - 1));
	}

	/** @type {utils.Utils['decimalAdjust']} */
	static decimalAdjust(type, value, exp = 0) {
		const [m, n = 0] = value.toString().split('e'),
		adjust_value = Math[type](`${m}e${parseInt(n) + exp}`),
		[nm, nn = 0] = adjust_value.toString().split('e');

		return Number(`${nm}e${parseInt(nn) - exp}`);
	}

	/** @type {utils.Utils['decodeHtmlEntity']} */
	static decodeHtmlEntity(arg) {
		const textarea = document.createElement('textarea');

		textarea.innerHTML = arg;

		return textarea.innerText;
	}

	/** @type {utils.Utils['sheetConvert']} */
	static sheetConvert(arg) {
		const s = Math.abs(arg);

		return {
			negative: arg < 0,
			ream: Math.trunc(s / 500),
			sheat: s % 500
		};
	}

	/** @type {utils.Utils['reamConvert']} */
	static reamConvert(arg) {
		const s = arg * 500;

		return Utils.sheetConvert(s);
	}

	/** @type {utils.Utils['cutConvert']} */
	static cutConvert(arg) {
		const arr = arg.split('|'),
		/** @type {utils.cut} */
		cut = { size: [] };

		arr.forEach((v, i, arr) => {
			if ((i == 0) && !/^0+$/.test(v)) {
				if (!/^\d{8}$/.test(v)) {
					cut.cut = v;
				} else {
					cut.size.push(v.replace(/^(\d{4})(\d{4})$/, '$1*$2').replace(/(?<=^)0+/, '').replace(/(?<=\*)0+/, ''));
				}
			} else {
				if (!/^0+$/.test(v)) {
					cut.size.push(v.replace(/^(\d{4})(\d{4})$/, '$1*$2').replace(/(?<=^)0+/, '').replace(/(?<=\*)0+/, ''));
				}
			}
		});

		return cut;
	}
}

class CubeProxy {
	/** @type {cubeProxy.CubeProxy<{[key: string]: any}>['target']} */
  #target;

	/** @type {cubeProxy.CubeProxy<{[key: string]: any}>['thisArg']} */
  #thisArg;

	/** @type {cubeProxy.Constructor<{[key: string]: any}>} */
  constructor(target, thisArg) {
    this.#target = target;
    this.#thisArg = thisArg;
  }

	/** @type {cubeProxy.CubeProxy<{[key: string]: any}>['set']} */
  async set(...arg) {
    if ((arg.length > 0) && (arg.length <= 2)) {
      switch(arg.length) {
        case 1: {
          const [newValue] = arg;

          this.#target = newValue;
          break;
        }
        case 2: {
          const [key, newValue] = arg;

          this.#target[key] = newValue;
          break;
        }
      }

      await this.#thisArg.render();
      this.#thisArg.eventInit();
    } else {
      throw new Error('param 개수 범위 초과')
    }
  }

	/** @type {cubeProxy.CubeProxy<{[key: string]: any}>['get']} */
  get(...arg) {
    if ((arg.length >= 0) && (arg.length <= 1)) {
      switch(arg.length) {
        case 0:
          return this.#target ?? null;
        case 1:
          const [key] = arg;

          return this.#target[key] ?? null;
      }
    } else {
      throw new Error('param 개수 범위 초과')
    }
  }
}