	/* Order Management */
/* 주문서 레이아웃 */
function om10Init(canvasIdx){
   idx = canvasIdx;
   cubeJsonData[currentCanvasIdx] = [];
   const workSpace = canvasBox[canvasIdx];
   om11Ctl(workSpace.children[0]);
   om12Ctl(workSpace.children[1]);
   om13Ctl(workSpace.children[2]);
   om15Ctl(workSpace.children[3]);
   om16Ctl(workSpace.children[4]);
   om17Ctl(workSpace.children[5]);
   
   if(!orderManagementCall){
	   callQuickSearch();
	   selectSearchPart(1);
	   
        for(let i=0; i<cubeJsonData[0]['cubeMasterKey']['cubeMasterPR'].length; i++){
            if(cubeJsonData[0]['cubeMasterKey']['cubeMasterPR'][i]['partnerCode'] == '1078152415'){
                tempSelectDatas['info']['partner'] = cubeJsonData[0].cubeMasterKey.cubeMasterPR[i];
                const formData = new FormData();
                formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
                formData.append('employeeCode', cubeJsonData[0]['employee']['employeeCode']);
                serverCallByFetchAfterAuth(formData, '/INITBUSINESSINFO', 'post', 'searchPartnerCreditCallBack');
                break;
            }
        }
   }
}

/* 
 * om11Ctl
 * : 주문서 생성 컨트롤러
 * @params  {HTMLNode} WorkBoard 
 */
function om11Ctl(...param){
	const workBoard = param[0]; //1
	workBoardActivation(workBoard, true, '매출처', 'var(--postit-7)');
	/* PartnerInfo Display Zone - 거래처가 있는 경우만 활성화 */
	const partnerInfo = workBoard.children[1].children[0];
	partnerInfo.innerHTML = '';
	partnerInfo.setAttribute('class','panel buyerInfo');
	partnerInfo.style.setProperty('display', 'none');
	
	/* BadgeInfo  relation-거래가능여부, method-거래방식, amount-거래가능금액, outstanding-미수금액 */
	const badgeInfo = createDIV(null, 'badgeInfo'); 
	appendBadge(badgeInfo, ['relation able', 'method able', 'amount able', 'outstanding able']);
	partnerInfo.appendChild(badgeInfo);
	
	/* KeyInfo */
	const keyInfo = createDIV(null, 'keyInfo');
	
	const major  = createDIV(null, 'major');
	appendBadge(major, ['partnerName', 'partnerReg', 'partnerCeo']);
	keyInfo.appendChild(major);

	const sub  = createDIV(null, 'sub');
	appendBadge(sub, ['partnerTel', 'partnerFax', 'partnerEmp']);
	keyInfo.appendChild(sub);
	
	partnerInfo.appendChild(keyInfo);
	
	/* AdditionalInfo  slaes-영업담당, support-지원담당, handler-처리담당 */
	const additionalInfo = createDIV(null, 'additionalInfo');
	appendBadge(additionalInfo, ['sales', 'support', 'handler']);
	partnerInfo.appendChild(additionalInfo);

}

/* 납품처 Board 활성화
 * @param[0]  {HTMLNode} WorkBoard 
 */
function om12Ctl(...param){
	const workBoard = param[0]; //2
	workBoardActivation(workBoard, true, '납품처', 'var(--postit-7)');
	
	/* DeliveryPlaceInfo Display Zone - 거래처가 있는 경우만 활성화 */
	const deliveryInfo = workBoard.children[1].children[0];
	deliveryInfo.setAttribute('class','panel deliveryInfo');
	deliveryInfo.style.setProperty('display', 'none');
}

/* 온라인 주문 Board 활성화
 * @param[0]  {HTMLNode} WorkBoard 
 */
function om13Ctl(...param){
	const workBoard = param[0]; //3
	workBoardActivation(workBoard, true, '온라인 주문', 'var(--postit-7)');
}

/* 상품 Board 활성화
 * @param[0]  {HTMLNode} WorkBoard 
 */
function om14Ctl(...param){
	const workBoard = param[0]; //6
	workBoardActivation(workBoard, true, '상품', 'var(--postit-7)');
}

/* 주문상품 Board 활성화
 * @param[0]  {HTMLNode} WorkBoard 
 */
function om15Ctl(...param){
	const workBoard = param[0];// 4
	workBoardActivation(workBoard, true, '주문상품', 'var(--postit-7)');
	
	/* OrderListInfo Dispaly Zone */
	const orderListInfo = workBoard.children[1].children[0];
	orderListInfo.setAttribute('class','panel orderListInfo');
	orderListInfo.style.setProperty('display', 'none');
}

/* 메모 Board 활성화
 * @param[0]  {HTMLNode} WorkBoard 
 */
function om16Ctl(...param){
	const workBoard = param[0]; // 2
	workBoardActivation(workBoard, true, '메모', 'var(--postit-7)');
	
	const memoInfo = workBoard.children[1].children[0];
	memoInfo.setAttribute('class','panel memoInfo');
    memoInfo.style.setProperty('display', 'none');
}

/* 거래처매출이력 Board 활성화
 * @param[0]  {HTMLNode} WorkBoard 
 */
function om17Ctl(...param){
	const workBoard = param[0]; //6
	workBoardActivation(workBoard, true, '거래처매출이력', 'var(--postit-7)');
	//5
	const tabList = [
					['주문상품목록','goodsList','var(--postit-7)'],
					 ['출고상태','statusList','var(--postit-7)']
					];
	createTabBox(workBoard,tabList);
}

/* tabBoxCreate
 * @param[0]  {HTMLNode} WorkBoard 
 * @param[1]  {Array} tabList
 */
function createTabBox(...param){
	const tabDiv = param[0].children[1].children[0];

	/* tabBox */
	const tabBox = createDIV(null,'tabBox',null); 
	tabDiv.style.setProperty('display','flex');
	tabDiv.appendChild(tabBox);
	
	for(let idx = 0; idx<param[1].length; idx++){
		/* tabBtn */
		const tabBtn = createDIV(null,'tabBtn '+ param[1][idx][1],null); 
		tabBtn.innerText = param[1][idx][0];
		tabBtn.setAttribute('class', 'badge '+param[1][idx][1]);
		tabBtn.style.setProperty('height',100/param[1].length+'%');
		tabBtn.style.setProperty('background-color',param[1][idx][2]);
		tabBtn.style.setProperty('cursor','pointer');
		tabDiv.children[0].appendChild(tabBtn);

		/* tabWorkBoard */
		const tabWorkBoard = document.createElement('div');
		tabWorkBoard.setAttribute('class', 'content '+ param[1][idx][1])
		tabWorkBoard.style.setProperty('display','none');
		tabWorkBoard.style.setProperty('border','2px solid ' + param[1][idx][2]);
		tabWorkBoard.style.setProperty('border-top-right-radius','var(--radius-small)');
		tabWorkBoard.style.setProperty('border-bottom-right-radius','var(--radius-small)');
		tabDiv.appendChild(tabWorkBoard);

		/* tabBdg */
		const tabBdg = document.createElement('div');
		tabBdg.setAttribute('class', 'badge')
		tabWorkBoard.appendChild(tabBdg);

		/* tabContents */
		const tabContents = document.createElement('div');
		tabContents.setAttribute('class', 'content')
		tabWorkBoard.appendChild(tabContents);

		/* tabPanel */
		const tabPanel = document.createElement('div');
		tabPanel.setAttribute('class', 'panel')
		tabContents.appendChild(tabPanel);

		if(idx == 0){
			tabWorkBoard.style.setProperty('display','');
		}

		tabBtn.addEventListener('click', (param) => {
			const contentList = tabWorkBoard.parentElement.children;
			for(let idx =1; idx< contentList.length; idx++){
				if(contentList[idx] != param.srcElement) contentList[idx].style.setProperty('display','none') ;
			}
			tabWorkBoard.style.setProperty('display','flex');
		})
	}

}

/* Quick Search 파트별 항목 선택 시 
 * @param[0] {String} 구분코드
 * @param[1] {int} 	  item Index
 */
function om10display(...param){
	if(param[0]  == '1'){
		tempSelectDatas['info']['partner'] = cubeJsonData[0].cubeMasterKey.cubeMasterPR[param[1]];
		/* 주문서에 출력할 거래처 정보 호출 */
		const formData = new FormData();
		formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
		formData.append('employeeCode', cubeJsonData[0]['employee']['employeeCode']);
		serverCallByFetchAfterAuth(formData, '/INITBUSINESSINFO', 'post', 'searchPartnerCreditCallBack');
		/* 주문서 거래처 관련 정보 출력 후 퀵서치의 상품 검색 선택 */
		selectSearchPart(2);
	}else if(param[0] == '0'){
		tempSelectDatas['info']['buy'] = cubeJsonData[0].cubeMasterKey.cubeMasterPR[param[1]];
		selectSearchPart(1);
	}else if(param[0] == '2'){
		/* 재고조회 여부 판단 */
        successGoods(cubeJsonData[0].cubeMasterKey.cubeMasterOG[param[1]]);
	}
}

/* 거래처 신용정보 서버조회 CallBack */
function searchPartnerCreditCallBack(...param){
	tempSelectDatas['info']['partnerCredit'] = param[0]['partnerCreditInfo'];
	tempSelectDatas['info']['partnerMemo'] = param[0]['selectNoticeByPartner'];
	cubeJsonData[currentCanvasIdx]['selectReleaseStatus'] = param[0]['selectReleaseStatus'];
	cubeJsonData[currentCanvasIdx]['selectSaleByPartner'] = param[0]['selectSaleByPartner'];

	setPartnerInfoOnBoard();
	if(tempSelectDatas['product'].length != 0) displayOrderList();
}

/**setPartnerInfoOnBoard
 * : 거래처 관련 데이터 수집 Controller 
 * 
 * */
function setPartnerInfoOnBoard(){
	/* 거래처 정보 WorkBoardPanel 활성화 */
	const panel = document.querySelector('#om10 > div:nth-child(1) > div.content > div');
	panel.style.setProperty('display', 'flex');
	
	/* 거래처의 관계 상태 코드 => 상태코드 PS3 이하가 아닌 경우 온라인 정보를 제외한 정보는 정지 */
	const stateCode = tempSelectDatas['info']['partner']['partnerStateCode'];
	setPartnerGeneralInfo(panel); // 거래처 일반 정보 출력 
	
	const dpPanel = document.querySelector('#om10 > div:nth-child(2) > div.content > div');
	if(stateCode <= 'PS3') {
		/* 납품처 리스트 출력하기 위한 Object Style 변경 */
		dpPanel.style.setProperty('display', 'flex');
		dpPanel.parentElement.previousSibling.style.setProperty('background-color','var(--postit-6)');

		/* 새로고침 생성 */
		if(!dpPanel.hasChildNodes()){
            additionalFeatures(dpPanel.parentElement.previousSibling, 'dpRefresh', null, 'refresh');
            additionalFeatures(dpPanel.parentElement.previousSibling, 'dpRegister', null, 'plus');
		}

		getDeliveryList(dpPanel);
	}

	/* partnerMemoInfo Call */
	const memoPanel = document.querySelector('#om10 > div:nth-child(5) > div.content > div');
	if(tempSelectDatas['info']['partnerMemo'] != null){
		memoPanel.style.setProperty('display', 'flex');
		memoPanel.style.setProperty('flex-direction', 'column');
		memoPanel.parentElement.previousSibling.style.setProperty('background-color','var(--postit-6)');
		if(!memoPanel.hasChildNodes()){
            additionalFeatures(memoPanel.parentElement.previousSibling, 'memoRefresh', null, 'refresh');
            additionalFeatures(memoPanel.parentElement.previousSibling, 'memoRegisterPopup', null, 'plus');
		}
	}
    getPartnerMemoList(tempSelectDatas['info']['partnerMemo']);
	return;
	// /* Release Call */
	if(cubeJsonData[currentCanvasIdx]['selectReleaseStatus'] != null){
		getReleaseList(cubeJsonData[currentCanvasIdx]['selectReleaseStatus']);
	}
//		cubeJsonData[currentCanvasIdx]['selectReleaseStatus'] = param[0]['selectReleaseStatus'];
//    	cubeJsonData[currentCanvasIdx]['selectSaleByPartner'] = param[0]['selectSaleByPartner'];
}

/**setPartnerGeneralInfo
 * : 거래처에 대한 일반정보 출력
 * @param 	{HTML Object}	출력지점 
 * */

function setPartnerGeneralInfo(panel){
	/* 거래처 여신 정보 --> ServerCall */
	const badgeInfo = panel.children[0];
	const ableAmount = tempSelectDatas['info']['partnerCredit']['orderableAmount'];
	const state = parseInt(tempSelectDatas['info']['partner']['partnerStateCode'].substr(2,1), 10);
	
	let orderingStatus = null, title = null, outstanding = null;
	if(state == 1){	
		orderingStatus = '입금확인'; ableTitle = '[ 입금금액 ] '; outstanding = '[ 환불금액 ] ';
		panel.parentElement.previousElementSibling.style.setProperty('background-color', 'var(--postit-4)');
		panel.children[1].style.setProperty('background-color', 'var(--postit-4)');
		badgeInfo.children[0].style.setProperty('background-color', 'var(--postit-4)');
		badgeInfo.children[1].style.setProperty('background-color', 'var(--postit-6)');
	}else if(state == 2){ 
		orderingStatus = '한도확인'; ableTitle = '[ 직권한도 ] '; outstanding = '[ 미수금액 ] ';
		panel.parentElement.previousElementSibling.style.setProperty('background-color', 'var(--postit-2)');
		panel.children[1].style.setProperty('background-color', 'var(--postit-2)');
		badgeInfo.children[0].style.setProperty('background-color', 'var(--postit-2)');
		badgeInfo.children[1].style.setProperty('background-color', 'var(--postit-1)');
	}else if(state == 3){ 
		orderingStatus = '주문가능'; ableTitle = '[ 가능금액 ] '; outstanding = '[ 미수금액 ] ';
		panel.parentElement.previousElementSibling.style.setProperty('background-color', 'var(--postit-5)');
		panel.children[1].style.setProperty('background-color', 'var(--postit-5)');
		badgeInfo.children[0].style.setProperty('background-color', 'var(--postit-5)');
		badgeInfo.children[1].style.setProperty('background-color', 'var(--postit-6)');
	}else{ 
		orderingStatus = '주문불가'; ableTitle = ''; outstanding = '[ 미수금액 ] ';
		panel.parentElement.previousElementSibling.style.setProperty('background-color', 'var(--postit-1)');
		panel.children[1].style.setProperty('background-color', 'var(--postit-1)');
		badgeInfo.children[0].style.setProperty('background-color', 'var(--postit-1)');
		badgeInfo.children[1].style.setProperty('background-color', 'var(--postit-2)');
	}
	
	badgeInfo.children[0].innerText = tempSelectDatas['info']['partner'].partnerStateName;
	badgeInfo.children[0].setAttribute('data-state', tempSelectDatas['info']['partner']['partnerStateCode']);
	badgeInfo.children[1].innerText = orderingStatus;
	badgeInfo.children[2].innerText = (ableAmount == -1)? "UNLIMITED" : ableTitle + ableAmount.toLocaleString('ko-KR');
	badgeInfo.children[2].setAttribute('data-able', (ableAmount == -1)? "UNLIMITED" : ableAmount);
	badgeInfo.children[3].innerText = outstanding + tempSelectDatas['info']['partnerCredit'].outstandingBalance.toLocaleString('ko-KR');
	badgeInfo.children[3].setAttribute('data-outstanding', tempSelectDatas['info']['partnerCredit']['outstandingBalance']);

	/* 거래처 정보 : 일반정보, 담당자 정보 --> cubeMasterKey */
	const generalInfo = panel.children[1];
	generalInfo.children[0].children[0].innerText = tempSelectDatas['info']['partner'].partnerName;
	generalInfo.children[0].children[1].innerText = setBusinessRegNumber(tempSelectDatas['info']['partner'].partnerCode);
	generalInfo.children[0].children[2].innerText = tempSelectDatas['info']['partner'].partnerCeo + ' 대표';
	
	let empName = getPartnerJobInfo(tempSelectDatas['info']['partner'].partnerCode, 'J17');
	if(empName != null){
		const empInfo = getPartnerEmpInfo(tempSelectDatas['info']['partner'].partnerCode, empName);
		generalInfo.children[1].children[2].innerText = '[ 담당 ] ' + empInfo['peName'];
		generalInfo.children[1].children[2].setAttribute('title', '[ 직급 : ' + empInfo['peLevel1'] + ']' + '  [ HP : ' + empInfo['pePhone2'] + ']' + '  [ Direct : ' + empInfo['peDirect3'] + ']' + '  [ Mail : ' + empInfo['peMail5'] + ']');
	}else{
		generalInfo.children[1].children[2].innerText = '[ 담당추가 ]';
		generalInfo.children[1].children[2].removeAttribute('title');
	}
	generalInfo.children[1].children[0].innerText = '[ TEL ] ' + setFormatPhoneNumber(tempSelectDatas['info']['partner'].partnerPhone);
	generalInfo.children[1].children[1].innerText = '[ FAX ] ' + tempSelectDatas['info']['partner'].partnerFax;
	
	/* 업무별 거래처 담당자 */
	const workEmpInfo = getWorkManager(tempSelectDatas['info']['partner'].partnerCode);
	panel.children[2].children[0].innerText = '[ 영업 ] ' + workEmpInfo['emName1'];
	panel.children[2].children[1].innerText = '[ 지원 ] ' + workEmpInfo['emName2'];
	panel.children[2].children[2].innerText = '[ 처리 ] ' + cubeJsonData[0]['employee']['employeeName'];
}

/**getDeliveryList 
 * : 거래처의 납품처 리스트 출력
 * @param 	{HTML Object}	출력지점 
 */
function getDeliveryList(panel){
	const columns = [
		['납품처명', 'dvName', '55%', 'left'],
		['전화번호', 'dvPhone', '45%', 'right'],
		[['납품처코드', 'dvCode', '100%', 'left']],
		['modDeliveryPlaceInfo']];
	
	/* Panel Init */
	panel.innerHTML = '';
	
	/* 납품처 검색박스 */
	const searchLayer = createDIV(null, 'searchLayer', null);
	const searchRange = createToggleSwitch('등록|전체', 'dpToggle', 'dpSwitch','getDpList', columns);
	searchRange.children[1].style.setProperty('color', 'var(--color-9)');
	searchRange.children[1].style.setProperty('border', '1px solid var(--postit-6)');
	searchRange.children[1].style.setProperty('background-color', 'var(--postit-6)');
	
	searchLayer.appendChild(searchRange);
	searchLayer.appendChild(createInputBox('text', 'searchDP', '', '납품처 검색', 'searchDP'));
	panel.appendChild(searchLayer);
	
	/* GRID LAYER */
	panel.appendChild(createDIV(null, 'gridLayer', null));
	
	/* 검색 마스터 원본 */
	const partnerCode = tempSelectDatas['info']['partner'].partnerCode;
	const toggle = document.querySelector('#om10 > div:nth-child(2) > div.content > div > div.searchLayer > div');
	
	const deliveryListPD = cubeJsonData[0].cubeMasterKey.cubeMasterPD;
	/* 거래처의 기존 납품처 Filtering */	
	cubeJsonData[1]['deliveryListPD'] = deliveryListPD.filter((data) => {
		if(data['partnerCode'] == partnerCode) {
			if(data['deliveryName'].length > 12) data['dvName'] = data['deliveryName'].substr(0, 12);
			else data['dvName'] = data['deliveryName'];
			data['dvPhone'] = setFormatPhoneNumber(data['deliveryPhone']);
			data['dvAddr'] = data['deliveryAddr'];
			data['dvCode'] = data['deliveryCode'];
			return data;
		}
	});
	/* 모든 납품처 */
	const deliveryListDP = cubeJsonData[0].cubeMasterKey.cubeMasterDP;
	cubeJsonData[1]['deliveryListDP'] = deliveryListDP.filter((data) => {
		if(data['dpName'].length > 12) data['dvName'] = data['dpName'].substr(0, 12);
		else data['dvName'] = data['dpName'];
		data['dvPhone'] = setFormatPhoneNumber(data['dpPhone']);
		data['dvAddr'] = data['dpAddr'];
		data['dvCode'] = data['dpCode'];
		return data;
	});

	const searchFieldList = ['dvName', 'dvPhone'];
	/* 검색어 입력 이벤트 */
	searchLayer.children[1].addEventListener('keyup', (e) => {
		const savingKeyword = 'deliveryList';

		searchMatchList(e.target.value.trim(), toggle.children[0].checked? cubeJsonData[1]['deliveryListDP'] : cubeJsonData[1]['deliveryListPD'], savingKeyword, searchFieldList,
				document.querySelector('#om10 > div:nth-child(2) > div.content > div > div.gridLayer'));

		/* 렌더링 */
		makeCubeGridInWorkBoard(panel.children[1], columns, savingKeyword, true, true, true);
	});

	/* 거래처의 기존 납품처 Filtering */
	getDpList(columns);
}

function getDpList(columns){
	const panel = document.querySelector('#om10 > div:nth-child(2) > div.content > div');
	const toggle = document.querySelector('#om10 > div:nth-child(2) > div.content > div > div.searchLayer > div');
	/* 렌더링 */
	makeCubeGridInWorkBoard(panel.children[1], columns, toggle.children[0].checked? 'deliveryListDP':'deliveryListPD', true, true, true);
}

/** modDeliveryPlaceInfo
 * : 특정 납품처 정보 삭제 및 수정
 * @param	{string : partnerCode}		거래처코드
 * @param	{string : deliveryCode}		납품처코드
 * */
function modDeliveryPlaceInfo(...param){
	const deliveryType = document.querySelector('#om10 > div:nth-child(2) > div.content > div > div.searchLayer > div').children[0];
	const boxInfo = [[param[0].dvName, '납품처명', 'long', true], [param[0].dvPhone, '전화번호', 'short', true],
		   			 [param[0].dvAddr, '납품처 주소','long', true]];
	let btnInfo = null;
	if(deliveryType.checked)
        btnInfo = [
            [null, 'confirmCheck double', 'pdRegister(\'' + JSON.stringify(param[0]) + '\')', '등록'],
            [null, 'confirmCheck double', 'cancelFunc(this)|modifyDelivery(\'' + JSON.stringify(param[0]) + '\')', '취소']
        ];
	else
        btnInfo = [
            [null, 'confirmCheck triple', 'transferFunc(\'' + JSON.stringify(param[0]) +'\')', '확인'],
            [null, 'confirmCheck triple', 'deleteFunc(\'' + JSON.stringify(param[0]) + '\')|modifyDelivery(\'' + JSON.stringify(param[0]) + '\')', '삭제'],
            [null, 'confirmCheck triple', 'cancelFunc(this)', '취소']
        ];
	popupContoller(boxInfo, btnInfo, param[1], [1.5, 1.6]);
}

/**transferFunc
 * : 주문서에 납품처 전송
 * @param {string - deliveryCode}	data
 */
function transferFunc(...data){
	cancelFunc(event.target);
	const datas = JSON.parse(data[0]);
    tempSelectDatas['info']['orderDeliveryPlace'] = datas['dvCode'];
    const info = document.querySelectorAll('.deliveryLayer .deliveryInfo');
    info[0].innerText = datas['dvName'];
    info[1].innerText = datas['dvAddr'];
    info[2].innerText = datas['dvPhone'];
}
/**dpRefresh
 * : cubeMasterKey로부터 새로 고침
 */
function dpRefresh(){
    const formData = new FormData();
    formData.append('pdVersion', cubeJsonData[0]['cubeMasterVersion'][5]['vcVersion']);
    formData.append('dpVersion', cubeJsonData[0]['cubeMasterVersion'][8]['vcVersion']);
    serverCallByFetchAfterAuth(formData, '/OM10REFRESHDP', 'post', 'CRUDDpCallBack', -1);
}

/* modifyDelivery
    납품처 수정
*/
function modifyDelivery(...param){
	const datas = JSON.parse(param[0]);
	console.log(datas);
	const formData = new FormData();
	const popupDialog = document.querySelector('#popupDialog');
    formData.append('dpName', popupDialog.children[0].value);
    formData.append('dpPhone', popupDialog.children[1].value.replace('-', ''));
    formData.append('dpAddress', popupDialog.children[2].value);
    formData.append('dpCode', (datas['dpCode'] != undefined) ?datas['dpCode'] :datas['deliveryCode']);

    formData.append('pdVersion', cubeJsonData[0]['cubeMasterVersion'][5]['vcVersion']);
    formData.append('dpVersion', cubeJsonData[0]['cubeMasterVersion'][8]['vcVersion']);
    formData.append('modDpType', 3);
    for (let key of formData.keys()) {
        console.log(key, ":", formData.get(key));
    }
	cancelFunc(event.target);
    serverCallByFetchAfterAuth(formData, '/OM10MODDP', 'post', 'CRUDDpCallBack', 3);
}


function CRUDDpCallBack(...param){
    console.log(param);
    if(param[0]['updatePdVersion'] != 0){
        cubeJsonData[0]['cubeMasterKey']['cubeMasterPD'] = param[0]['partnerDeliveryPlaces'];
        cubeJsonData[0]['cubeMasterVersion'][5]['vcVersion'] = param[0]['updatePdVersion']; // PD
    }
    if(param[0]['updateDpVersion'] != 0){
        cubeJsonData[0]['cubeMasterKey']['cubeMasterDP'] = param[0]['deliveryPlaces'];
        cubeJsonData[0]['cubeMasterVersion'][8]['vcVersion'] = param[0]['updateDpVersion'];// DP
    }
    /* indexDB refresh */
//    cubeMasterKeyCheck(cubeJsonData[0].cubeMasterVersion);
    getDeliveryList(document.querySelector('#om10 > div:nth-child(2) > div.content > div'));
}

/**dpRegister
 * : cubeMasterKey로부터 새로 고침
 */
function dpRegister(){
	const boxInfo = [
		['', '납품처명', 'long', false], ['', '전화번호', 'short', false],
		['', '납품처 주소','long', false]];

	const btnInfo = [[ null, 'confirmCheck double', 'newDeliveryPlace()', '등록'], [ null, 'confirmCheck double', 'cancelFunc(this)', '취소']];

	popupContoller(boxInfo, btnInfo, document.querySelector('#om10 > div:nth-child(2) > div.badge > div.addBtn.plus'), [1.5, 1.6]);
}

/**dpRegister
 * : 서버 등록 --> cubeMasterKey PD 버전 업데이트 --> 클라이언트 마스터키 갱신
 */
function newDeliveryPlace(){
	const data = document.querySelector('#popupDialog');
    // 납품처 전화번호 주소
    const formData = new FormData();
    formData.append('employeeCode', cubeJsonData[0]['employee']['employeeCode']);
    formData.append('modDpType', 0);
    formData.append('pdVersion', cubeJsonData[0]['cubeMasterVersion'][5]['vcVersion']);
    formData.append('dpVersion', cubeJsonData[0]['cubeMasterVersion'][8]['vcVersion']);
    formData.append('dpName', data.children[0].value);
    formData.append('dpPhone', data.children[1].value.replace('-', ''));
    formData.append('dpAddress', data.children[2].value);
	cancelFunc(event.target);
    serverCallByFetchAfterAuth(formData, '/OM10MODDP', 'post', 'CRUDDpCallBack', 0);
}
/**pdRegister
 * 전체 납품처 목록에서 특정 거래처 납품처로 등록
 * @param {string - partnerCode:deliveryCode}	codes
 */
function pdRegister(...param){
    const data = JSON.parse(param[0]);
    const formData = new FormData();
    formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
    formData.append('pdVersion', cubeJsonData[0]['cubeMasterVersion'][5]['vcVersion']);
    formData.append('prDpCode', data['dpCode']);
    formData.append('modDpType', 1);
    serverCallByFetchAfterAuth(formData, '/OM10MODDP', 'post', 'CRUDDpCallBack', 1);
	cancelFunc(event.target);
}

/**deleteFunc
 * : 납품처 삭제 --> 서버 삭제 --> cubeMasterKey PD 버전 업데이트 --> 클라이언트 마스터키 갱신
 * @param {string - partnerCode:deliveryCode}	codes
 */
function deleteFunc(...param){
    const formData = new FormData();
    const data = JSON.parse(param[0]);

    formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
    formData.append('pdVersion', cubeJsonData[0]['cubeMasterVersion'][5]['vcVersion']);
    formData.append('prDpCode', data['deliveryCode']);
    formData.append('modDpType', 2);
    serverCallByFetchAfterAuth(formData, '/OM10MODDP', 'post', 'CRUDDpCallBack', 2);
	cancelFunc(event.target);
}

/**cancelFunc
 * : 팝업 삭제
 * @param {Object - this}	obj
 */
function cancelFunc(obj){
	obj.parentElement.remove();
}


/* 주문 상품 리스트 출력 */
function displayOrderList(...param){
    const orderList = tempSelectDatas['product'];

    const orderPanel = document.querySelector('#om10 > div:nth-child(4) > div.content > div');
    orderPanel.innerHTML = '';
    orderPanel.style.setProperty('display', 'flex');
    orderPanel.parentElement.previousSibling.style.setProperty('background-color','var(--postit-4)');

    const headerLayer = createDIV(null, 'headerLayer', null);
    const [tempLayer, sumLayer] = [createDIV(null, 'tempLayer'),
    createDIV(null, 'infoLayer')];
    headerLayer.append(tempLayer, sumLayer);

    if(orderList.length == 0) return;
    let sumWeight = 0, sumPrice = 0, sumQty = 0;
    let paju = false, eulji = false, distributer = true;
    const listLayer = createDIV(null, 'listLayer', null);
    orderList.forEach((goods, index) => {
		switch (goods['centerCode']){
			case 'SS11': eulji = true; break;
			case 'SS12': paju = true; break;
			case 'ET00': distributer = true; break;
		}
        /* listLayer > itemLayer > badge, panel */
        const itemLayer = createDIV(null, 'itemLayer', null);
        itemLayer.setAttribute('data-index',index);
        const badgeLeft = createDIV(null, 'badge left', null)
        itemLayer.appendChild(badgeLeft);

		badgeLeft.setAttribute('draggable',"true");
		badgeLeft.setAttribute('ondragstart',"onDragStart(event)");
		badgeLeft.setAttribute('ondragover',"onDragOver(event)");
		badgeLeft.setAttribute('ondrop',"onDrop(event)");

        additionalFeatures(badgeLeft, 'orderListDivide', null, 'plus', [goods, index]);
        additionalFeatures(badgeLeft, 'orderListDelete', null, 'delete', [goods, index]);
        additionalFeatures(badgeLeft, 'orderListSample', null, 'sample', [goods, index]);

        itemLayer.appendChild(createDIV(null, 'goods', null));
        itemLayer.appendChild(createDIV(null, 'badge right', null));

        itemLayer.children[1].addEventListener('click', (event) => {
            const parent = listLayer;
            for(let idx = 0; idx < parent.childElementCount; idx++){
                if(parent.children[idx].children[0].classList.contains('on')) {
                    parent.children[idx].children[0].classList.remove('on');
                    parent.children[idx].children[2].classList.remove('on');
                }
            }
            itemLayer.children[0].classList.add('on');
            itemLayer.children[2].classList.add('on');
        });

        /* 상품 정보 담기 */
        makeOrderingTag(itemLayer, orderList, index);

        listLayer.appendChild(itemLayer);
        listLayer.children[0].children[0].classList.add('on');
        listLayer.children[0].children[2].classList.add('on');
        console.log(goods['sales']);
        sumWeight += parseFloat(goods['weight']); sumPrice += goods['sales'];
		sumQty += parseFloat(goods['qty']);
    });
	const dateLayer = createDIV(null, 'dateLayer');
	sumLayer.appendChild(dateLayer);
	const inputWnDate = createInputBox('date', 'wnDate', tempSelectDatas['info']['wnDate'], '희망일', 'searchPart')
	dateLayer.appendChild(inputWnDate);
	inputWnDate.addEventListener('change', function(){
		tempSelectDatas['info']['wnDate'] = this.value;
	})

    tempSelectDatas['info']['sumPrice'] = sumPrice;
	const textLayer = createDIV(null, 'textLayer');
	sumLayer.appendChild(textLayer);
	textLayer.innerText = `총 수량 : ${sumQty}R 총 중량 : ${sumWeight}kg 예상 매출액 : ${sumPrice.toLocaleString('ko-KR')}원`;

	/* commandLayer - 납품처 표시, 임시저장, 저장, 적송, 입고처 등 선택하는 Layer */
    const commandLayer = createDIV(null, 'commandLayer', null);

	/* 선택 영역 */
    const [saveOrderBtn, tempBtn, costInput, deliveryPlaceLayer] = [
        createButton('button', '저장', 'searchPart', null),
        createButton('button', '임시저장', 'searchPart', 'temporaryOrder()'),
		createInputBox(
			'text',
			'cost',
			Math.ceil((sumWeight != 0 ?sumWeight :1) / 100) * 2000,
			'운반비', 'searchPart'
		),
        createDIV('', 'deliveryLayer')
    ];
    commandLayer.append(saveOrderBtn, tempBtn, costInput, deliveryPlaceLayer);
    saveOrderBtn.addEventListener('click',()=>{
        if(confirm('저장하시겠습니까?')){
            saveOrder();
        }
    })

    costInput.disabled = true;
    costInput.addEventListener('dblclick', function(){
        this.disabled = !this.disabled;
    })

	/* 납품처 표시 영역 */
	const deliveryPlaceInfo = [
        createDIV('', 'deliveryInfo name'),
        createDIV('', 'deliveryInfo address'),
        createDIV('', 'deliveryInfo phone'),
    ]
    deliveryPlaceInfo.forEach(dpInfo =>{deliveryPlaceLayer.appendChild(dpInfo)});

	if(distributer && tempSelectDatas['info']['partner']['partnerCode'] != '1078152415'){
		const startingCenterLayer = createDIV('', 'centerLayer');
		commandLayer.insertBefore(startingCenterLayer, deliveryPlaceLayer);
		const options = [
			{'levCode': 'SS11', 'levName': '을지'},
			{'levCode': 'SS12', 'levName': '파주'},
		];
		const select = createSelect('warehousing', options, 'searchPart', '입고처');
		startingCenterLayer.appendChild(select);
		select.addEventListener('change', function(){
			tempSelectDatas['product'].forEach(product=>{
				if(this.value != '입고처' && product['centerCode'] == 'ET00'){
					product['warehousingCenter'] = this.value;
				}else product['warehousingCenter'] = null;
			})
		})
	}

    if(paju && eulji && tempSelectDatas['info']['partner']['partnerCode'] != '1078152415'){
        const startingCenterLayer = createDIV('', 'centerLayer');
        commandLayer.insertBefore(startingCenterLayer, deliveryPlaceLayer);
        const options = [
            {'levCode': 'SS11', 'levName': '을지'},
            {'levCode': 'SS12', 'levName': '파주'},
        ];
        const select = createSelect('lgort', options, 'searchPart', '적송');
        startingCenterLayer.appendChild(select);
        select.addEventListener('change', function(){
            orderList.forEach((order, idx)=>{
                if(['SS11', 'SS12'].includes(order['centerCode'])){
                    const states = listLayer.children[idx].querySelectorAll('.distribute>div');
                    for(let state of states){
                        state.style.setProperty('background-color', 'var(--postit-7)');
                    }
                    if(this.value != '적송' && order['centerCode'] != this.value)
                        states[4].style.setProperty('background-color', 'var(--postit-2)');
                    else{
                        states[1].style.setProperty('background-color', 'var(--postit-2)');
                        states[2].style.setProperty('background-color', 'var(--postit-2)');
                    }
                }
            })
        })
    }
    orderPanel.append(headerLayer, listLayer, commandLayer);
    displayTempLayer();
    for(let sample of document.querySelectorAll('.addBtn.sample')){
        sample.innerText = '샘';
    }
}

// 주문서 임시 저장
function temporaryOrder(...param){
    tempSelectDatasList.push(tempSelectDatas);
    selectSearchPart(1);
    cubeJsonData[1]['stock'] = [];
    cubeJsonData[1]['deliveryPlaceList'] = [];
    cubeJsonData[1]['orderListGrid'] = [];
    cubeJsonData[1]['stock']['orderList'] = [];
    tempSelectDatas = []; // 주문임시데이터
    tempSelectDatas['info'] = {"partner": null, "buy" : [new Set(), [], []], "deliveryPlace" : null, "wnDate" : null};
    tempSelectDatas['product'] = [];
    selectHTML('div:nth-child(4) > div.content > div > div.listLayer').innerHTML = '';
    selectHTML('div:nth-child(4) .sumLayer').innerText = '';
    displayTempLayer();
}

// 임시 저장된 주문서 display
function displayTempLayer(...param){
    const tempLayer = selectHTML('div:nth-child(4) > .content .tempLayer');
    tempLayer.innerHTML = '';
    tempSelectDatasList.forEach((tempDatas, i)=>{
        const tempDiv = createDIV('', 'temp');
        tempLayer.appendChild(tempDiv);
        tempDiv.innerText = `${i+1}: ${tempDatas['info']['partner']['partnerName']}`;
        tempDiv.setAttribute('data-idx', i);
        tempDiv.addEventListener('click', function(){
            if(tempSelectDatas['product'].length > 0) tempSelectDatasList.push(tempSelectDatas);
            tempSelectDatas = tempSelectDatasList[tempDiv.dataset['idx']];
            tempSelectDatasList.splice(i, 1);
			displayOrderList();
            const formData = new FormData();
            formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
            formData.append('employeeCode', cubeJsonData[0]['employee']['employeeCode']);
            serverCallByFetchAfterAuth(formData, '/INITBUSINESSINFO', 'post', 'searchPartnerCreditCallBack');
        })

    })
}

// 주문서 상품 수량 나누기
function orderListDivide(...param){
    const [goods, idx] = param[0];
    // const orderList = tempSelectDatas['orderList'];
    const orderList = tempSelectDatas['product'];
    cancelCheck('subDialog')
	const orderDialog = createDIV('subDialog', 'orderDialog', '');
	orderDialog.style.top =  (window.pageYOffset + event.target.getBoundingClientRect().bottom + 5) + 'px';
	orderDialog.style.left = (window.pageXOffset + event.target.getBoundingClientRect().left + (event.target.offsetWidth / 3)) +'px';
	//수량 입력 Box
	const qtyBox = createInputBox('text', 'qty', '', '', 'qty');
	// 확인 Btn
	const confirm = createDIV('', 'confirmCheck', null);
	confirm.innerText = '확인'
	// 취소 Btn
	const cancel = createDIV('', 'confirmCheck', null);
	cancel.innerText = '취소'
	cancel.addEventListener('click', (e)=>{cancelCheck('subDialog');});

	confirm.addEventListener('click', ()=>{
	    if(qtyBox.value != ''){
	        const qty = Math.round(orderList[idx]['qty'] / qtyBox.value);
	        const weight = Math.round(orderList[idx]['weight'] / qtyBox.value);
	        const beforeArray = orderList.slice(0, idx);
	        const afterArray = orderList.slice(idx + 1);
            for(let i=0; i<qtyBox.value; i++){
                beforeArray.push(structuredClone(orderList[idx]))
                beforeArray.at(-1)['qty'] = qty;
                beforeArray.at(-1)['weight'] = weight;
            }
            tempSelectDatas['product'] = beforeArray.concat(afterArray);
            displayOrderList();
	        cancel.click();
	    }
	})
	qtyBox.addEventListener('keyup', function(e){if(e.key == 'Enter' && qtyBox.value != ''){confirm.click(); cancel.click();}})
	orderDialog.appendChild(qtyBox);
	orderDialog.appendChild(confirm);
	orderDialog.appendChild(cancel);
	document.body.appendChild(orderDialog);

}

// 주문서 상품 삭제
function orderListDelete(...param){
    const [goods, idx] = param[0];
    const orderList = tempSelectDatas['product'];
    orderList.splice(idx, 1);
    displayOrderList();
    if(orderList.length == 0){
        cubeJsonData[1]['orderListGrid'] = [];
        cubeJsonData[1]['stock']['orderList'] = [];
        tempSelectDatas['product'] = [];
    }
}

// 주문서 상품 샘플 처리
function orderListSample(...param){
    const [goods, idx] = param[0];
    // const orderList = tempSelectDatas['orderList'];
    if(goods['sample']) goods['sample'] = false;
    else goods['sample'] = true;
    document.querySelectorAll('.addBtn.sample')[idx].classList.toggle('on')
}

// 주문서 저장
function saveOrder(){
    const partnerAble = document.querySelector('.item.amount.able').dataset['able'];
    if(document.querySelector('#om10 > div:nth-child(4) > div.content > div > div.commandLayer > input:nth-child(1)')
               .dataset['wait'] == 1) return;
//    if(partnerAble != 'UNLIMITED' && partnerAble < tempSelectDatas['info']['sumPrice']){
//        alert('여신 한도 확인 필요');
//        document.querySelector('#om10 > div:nth-child(4) > div.content > div > div.commandLayer > input:nth-child(1)')
//                       .dataset['wait'] = 0;
//        return;
//    }
    if(tempSelectDatas['info']['orderDeliveryPlace'] == undefined){
        alert('납품처를 선택해 주세요');
        document.querySelector('#om10 > div:nth-child(4) > div.content > div > div.commandLayer > input:nth-child(1)')
                       .dataset['wait'] = 0;
        return;
    }

    const lgort = selectHTML('> div:nth-child(4) div.centerLayer > select[name="lgort"]');
    if(lgort != null && lgort.value == '적송'){
        alert('적송 선택해 주세요 ')
        document.querySelector('#om10 > div:nth-child(4) > div.content > div > div.commandLayer > input:nth-child(1)')
                       .dataset['wait'] = 0;
        return;
    }
    let insertType = null, orderType = null, warehousingCenterCode = null, releaseCenterCode = null;

    const remarks = document.querySelectorAll('.listLayer .commentInfo');
    const deliveryCost = document.querySelector('#om10 > div:nth-child(4) > div.content > div > div.commandLayer > input:nth-child(3)');
    const datas = tempSelectDatas['product'];

    const formData = new FormData();
    let prefix = 'order.orderDetail[';
    datas.forEach((data, idx) =>{ // 주문 테이블
//        insertType
//            0 = 자사 매입(주문, 발주, 입고)
//            1 = 직송(주문, 발주)
//            2 = 재단(주문, 발주, 입고, 출고)
//            3 = 자사 출고(주문, 출고)
//            4 = 자사 이관(주문, 출고, 입고, 재고이관)
//            5 = 자사 이관 후 출고 (입고, 이관, 출고, 출고)
		const partnerCheck = tempSelectDatas['info']['partner']['partnerCode'] != '1078152415';
        switch (data['orderType']){
            case 0: // 제지사
                if(partnerCheck){ // 직송 or 재단
                    switch (tempSelectDatas['info']['deliveryPlace']['phone']){ //
                        case '02-2270-4900': case '02-2274-0021': case '2274-0021': // 을지
                            insertType = 2;
                            warehousingCenterCode = 'SS11';
                            releaseCenterCode = 'SS11';
							orderType = 'O41';
                            break;
                        case '031-943-0918': // 파주
                            insertType = 2;
                            warehousingCenterCode = 'SS12'
                            releaseCenterCode = 'SS12';
							orderType = 'O41';
                            break;
                        default: insertType = 1;
                    }
                }else{ // 자사 매입
                    insertType = 0;
					if(data['warehousing']){
						switch (tempSelectDatas['info']['deliveryPlace']['phone']){
							case '02-2270-4900': case '02-2274-0021': case '2274-0021': // 을지
								warehousingCenterCode = 'SS11';
								orderType = 'O41';
								break;
							case '031-943-0918': // 파주
								warehousingCenterCode = 'SS12'
								orderType = 'O41';
								break;
						}
					}else if(tempSelectDatas['info']['orderDeliveryPlace'] == '256'){
						warehousingCenterCode = 'SS11';
						data['warehousing'] = true;
					}else if(tempSelectDatas['info']['orderDeliveryPlace'] == '463'){
						warehousingCenterCode = 'SS12';
						data['warehousing'] = true;
					}
                }
                if(orderType == null) orderType = 'O42';
                break;
            case 1: // 자사
				if(!partnerCheck) {
					orderType = 'O43';
					if (lgort != null && lgort.value != '적송') {
						if (lgort.value == data['centerCode']) {
							warehousingCenterCode = data['centerCode'];
							releaseCenterCode = data['centerCode'];
						}
						insertType = 5;
					}else{
						insertType = 4
						releaseCenterCode = data['centerCode'];
						warehousingCenterCode = data['centerCode'] == 'SS11' ?'SS12' :'SS11';
					}
				}else{
					orderType = 'O41';
					releaseCenterCode = data['centerCode'];
					// 입고 후 출고 예정 상태값
					insertType = 3;
				}
                break;
            case 2: // 지업사
                if(!partnerCheck){
					insertType = 0;
                    if(tempSelectDatas['info']['orderDeliveryPlace'] == '256'){
                        warehousingCenterCode = 'SS11';
						data['warehousing'] = true;
					}
                    else if(tempSelectDatas['info']['orderDeliveryPlace'] == '463'){
						warehousingCenterCode = 'SS12';
						data['warehousing'] = true;
					}
					orderType = 'O42';
                }else if(data['warehousingCenter'] != null){
					warehousingCenterCode = data['warehousingCenter'];
					releaseCenterCode = data['warehousingCenter'];
					insertType = 2;
					orderType = 'O41';
				}else{
					insertType = 1;
					orderType = 'O42';
				}
                break;
        }
        formData.append(prefix + idx +'].detailNumber', idx + 1);
        formData.append(prefix + idx +'].productCode', data['ogCode'] + data['sizeCode']);
        formData.append(prefix + idx +'].qty', data['qty']);
        formData.append(prefix + idx +'].weight', parseFloat(data['weight']) * 100);
        if(data['isCut'] != undefined)
            formData.append(prefix + idx +'].isCut', data['isCut']);
        formData.append(prefix + idx +'].orderStateCode', data['sample'] ?'O19' :'O11');
        const colorCode = (data['color']) ?data['color']['colorCode'] :'C000';
        formData.append(prefix + idx +'].colorCode', colorCode);
        formData.append(prefix + idx +'].centerCode', data['centerCode']);
        formData.append(prefix + idx +'].orderPartnerCode', data['purchaseCode']);
        formData.append(prefix + idx +'].orderType', data['orderType']);
        formData.append(prefix + idx +'].stockType', data['stockType']);
        formData.append(prefix + idx +'].insertType', insertType);
        formData.append(prefix + idx +'].paperMakerMapping', data['mappingCode']);
        formData.append(prefix + idx +'].remarkList[0].rmItcode', 'OR1');
        formData.append(prefix + idx +'].remarkList[0].rmText', remarks[idx].children[0].value);
        formData.append(prefix + idx +'].remarkList[1].rmItcode', 'OR2');
        formData.append(prefix + idx +'].remarkList[1].rmText', remarks[idx].children[1].value);
        formData.append(prefix + idx +'].price', data['price']);
        formData.append(prefix + idx +'].warehousing', data['warehousing']);
		let packagingCode = 'OW1';
        switch (data['packaging']){
            case 'S': packagingCode = 'OW2'; break;
            case 'R/L': packagingCode = 'OW3'; break;
        }
        formData.append(prefix + idx +'].packagingCode', packagingCode);
    })
    /* 주문 시 수량을 나눠서 넣어야 하는 건이 있음.
       주문 테이블에만 수량을 나누고 발주, 출고, 입고 테이블엔 나누기 전 수량을 넣기 위해
       배열을 2개로 나눔.
       ** 2024-01-19 **
       주문 테이블의 하위 테이블들이 상세 참조를 못함. 다시 배열 1개로 처리함
    */
    if(warehousingCenterCode) formData.append('warehousingCenterCode', warehousingCenterCode);
    if(releaseCenterCode) formData.append('releaseCenterCode', releaseCenterCode);
    if(!deliveryCost.disabled) formData.append('deliveryCost', deliveryCost.value);
    formData.append('order.orStcode2', orderType);
    formData.append('order.deliveryCode', tempSelectDatas['info']['orderDeliveryPlace']);
    formData.append('order.wantDate', tempSelectDatas['info']['wnDate']);
    formData.append('wantTime', tempSelectDatas['info']['wnTime']);
    formData.append('order.orderPartnerCode', tempSelectDatas['info']['partner']['partnerCode']);
    formData.append('order.employeeCode', cubeJsonData[0]['employee']['employeeCode']);
    for (let key of formData.keys()) {
        console.log(key, ":", formData.get(key));
    }
	document.querySelector('#om10 > div:nth-child(4) > div.content > div > div.commandLayer > input:nth-child(1)')
		.setAttribute('date-wait', '1');
	serverCallByFetchAfterAuth(formData, '/INSERTORDER', 'post', 'saveOrderCallBack');
}

// 주문서 저장 callBack
function saveOrderCallBack(...param){
    console.log(param);
	const msg = (param[0]['result'])? '0-성공' :'1-실패';
	messageBoardCall(`${msg.split('-')[0]}:주문서 저장:${msg.split('-')[1]}:확인`);
	if(param[0]['result']){
        cubeJsonData[1]['stock'] = [];
        cubeJsonData[1]['deliveryPlaceList'] = [];
        cubeJsonData[1]['orderListGrid'] = [];
        cubeJsonData[1]['stock']['orderList'] = [];
        tempSelectDatas = []; // 주문임시데이터
        tempSelectDatas['info'] = {"partner": null, "buy" : null, "deliveryPlace" : null, "wnDate" : null};
        tempSelectDatas['product'] = [];

        om11Ctl(document.querySelector('#om10 > div:nth-child(1)'));
		document.querySelector('#om10 > div:nth-child(2) .panel').innerHTML = '';
        om12Ctl(document.querySelector('#om10 > div:nth-child(2)'));
        om16Ctl(document.querySelector('#om10 > div:nth-child(5)'));
        displayOrderList();
        selectSearchPart(1);
	}else{
		document.querySelector('#om10 > div:nth-child(4) > div.content > div > div.commandLayer > input:nth-child(1)')
				   .dataset['wait'] = 0;
	}
}

// 주문 수정
function modifyOrder(){
    const formData = new FormData();
    formData.append('order.deliveryCode', tempSelectDatas['info']['orderDeliveryPlace']);
    let prefix = 'order.orderDetail[';
    tempSelectDatas['product'].forEach((data, idx)=>{
        formData.append(prefix + idx + '].orderCode', data['orderCode']);
        formData.append(prefix + idx + '].detailNumber', data['detailNumber']);
        formData.append(prefix + idx + '].qty', data['qty']);
        formData.append(prefix + idx + '].weight', parseFloat(data['weight']) * 100);
        formData.append(prefix + idx + '].orderPartnerCode', data['orderPartnerCode']);
        formData.append(prefix + idx + '].packagingCode', data['packagingCode']);
    })
        for (let key of formData.keys()) {
            console.log(key, ":", formData.get(key));
        }
    serverCallByFetchAfterAuth(formData, '/MODIFYORDER', 'post', 'modifyOrderCallBack');
}

/**
 * 주문 수정 callBack
 * @param param
 */
function modifyOrderCallBack(...param){
    console.log(param);
   	const msg = (param[0]['result'])? '0-성공' :'1-실패';
   	messageBoardCall(`${msg.split('-')[0]}:주문 수정:${msg.split('-')[1]}:확인`);
   	if(param[0]['result']){
           cubeJsonData[1]['stock'] = [];
           cubeJsonData[1]['deliveryPlaceList'] = [];
           cubeJsonData[1]['orderListGrid'] = [];
           cubeJsonData[1]['stock']['orderList'] = [];
           tempSelectDatas = []; // 주문임시데이터
           tempSelectDatas['info'] = {"partner": null, "buy" : [new Set(), [], []], "deliveryPlace" : null, "wnDate" : null};
           tempSelectDatas['product'] = [];
           selectSearchPart(1);
           displayOrderList();
   	}
}


/**makeOrderingTag
 * : 품목 정보 생성
 * @param {itemLayer : HTML Object}  담을 HTML Object
 * */
function makeOrderingTag(itemLayer, dataList, idx){
	const info = dataList[idx];
	const item = itemLayer.children[1];
	const itemFeatures = [createDIV(null, 'businessInfo', null), createDIV(null, 'paperInfo', null), createDIV(null, 'cutInfo', null), 
						  createDIV(null, 'costInfo', null), createDIV(null, 'commentInfo', null)];
	
	const businessInfo = [createDIV(null, 'title', null), createDIV(null, 'release', null), createDIV(null, 'distribute', null), 
					   	  createDIV(null, 'paperMaker', null)];
	const paperInfo = [createDIV(null, 'title', null), createDIV(null, 'ogInfo', null), createDIV(null, 'sizeInfo', null), 
					   createDIV(null, 'salesInfo', null)];
	const cutInfo = [createDIV(null, 'title', null), createDIV(null, 'cutDetail', null)];
	const costInfo = [createDIV(null, 'title', null), createDIV(null, 'costDetail', null)];
	const commentInfo = [createInputBox('text', null, '', '물류 비고', 'comment'), createInputBox('text', null, '', '상품 비고', 'comment'), 
						 createInputBox('text', null, '', '매핑 코드', 'mapping')];

	/* 매입-매출 */
	businessInfo[0].innerText = '매입 매출 물류 정보';
	/* 매입-매출 >> 매입처 출고지 표시 */
	businessInfo[1].appendChild(createDIV(null, 'purchase', null));
	businessInfo[1].appendChild(createDIV(null, 'center', null));
	businessInfo[1].children[0].innerText = info.purchaseName;
	if(info.centerName)
    	businessInfo[1].children[1].innerText = info.centerName.indexOf('-') != -1
    	    ?info.centerName.split('-')[1]: info.centerName;
	/* 매입-매출 - 물류 */
	const bzState = [createDIV(null,'sales', null), createDIV(null,'sales', null),
					 createDIV(null,'transfer', null), createDIV(null,'transfer', null), createDIV(null,'transfer', null),
					 createDIV(null,'transfer', null), createDIV(null,'transfer', null), createDIV(null,'transfer', null)];
	const stateText = ['매입', '매출', '거래', '센터', '이관', '거래', '센터', '이관'];
	const partnerCheck = tempSelectDatas['info']['partner']['partnerCode'] != '1078152415';
    switch (info['orderType']){
        case 0: // 제지사
            switch (info['stockType']){
				case -1: // 정상, 공용
					bzState[0].style.setProperty('background-color', 'var(--postit-2)');
					if(partnerCheck){
						bzState[1].style.setProperty('background-color', 'var(--postit-2)');
						bzState[2].style.setProperty('background-color', 'var(--postit-2)');
						bzState[5].style.setProperty('background-color', 'var(--postit-2)');
                   }else{
						bzState[3].style.setProperty('background-color', 'var(--postit-2)');
						bzState[4].style.setProperty('background-color', 'var(--postit-2)');
					}
                    break;
				case 0: // 매입, 임대(매출보관 O)
                    if(partnerCheck){
						bzState[6].style.setProperty('background-color', 'var(--postit-2)');
						bzState[7].style.setProperty('background-color', 'var(--postit-2)');
					}else{
                        bzState[3].style.setProperty('background-color', 'var(--postit-2)');
                        bzState[4].style.setProperty('background-color', 'var(--postit-2)');
					}
                    break;
				case 1: // 매입, 임대(매출보관 X)
                    if(partnerCheck){
                        bzState[1].style.setProperty('background-color', 'var(--postit-2)');
                        bzState[3].style.setProperty('background-color', 'var(--postit-2)');
                        bzState[4].style.setProperty('background-color', 'var(--postit-2)');
                        bzState[5].style.setProperty('background-color', 'var(--postit-2)');
                    }else{
                        bzState[3].style.setProperty('background-color', 'var(--postit-2)');
                        bzState[4].style.setProperty('background-color', 'var(--postit-2)');
                    }
                    break;
            }
            break;
        case 1: // 자사
            if(partnerCheck){
                if(info['stockType'] != 0){
                        bzState[1].style.setProperty('background-color', 'var(--postit-2)');
                        bzState[6].style.setProperty('background-color', 'var(--postit-2)');
                        bzState[7].style.setProperty('background-color', 'var(--postit-2)');
                }else{
					bzState[3].style.setProperty('background-color', 'var(--postit-2)');
					bzState[4].style.setProperty('background-color', 'var(--postit-2)');
				}
            }else{
				bzState[3].style.setProperty('background-color', 'var(--postit-2)');
				bzState[4].style.setProperty('background-color', 'var(--postit-2)');
			}
            info['mappingCode'] = '신승';
            break;
        case 2: // 지업사
            bzState[0].style.setProperty('background-color', 'var(--postit-2)');
            if(partnerCheck){
				bzState[1].style.setProperty('background-color', 'var(--postit-2)');
				bzState[2].style.setProperty('background-color', 'var(--postit-2)');
				bzState[6].style.setProperty('background-color', 'var(--postit-2)');
				bzState[7].style.setProperty('background-color', 'var(--postit-2)');
            }else{
	            bzState[3].style.setProperty('background-color', 'var(--postit-2)');
	            bzState[4].style.setProperty('background-color', 'var(--postit-2)');
			}
            info['mappingCode'] = '지업사';
            break;
    }
	bzState.forEach((state, index) => {
		state.innerText = stateText[index];
		businessInfo[2].appendChild(state);
	});
	
	businessInfo[3].appendChild(createDIV(null, 'makerName', null));
	// businessInfo[3].children[0].innerText = info.paperMakerName;
	let paperMakerImage = null;
	cubeJsonData[0]['cubeMasterKey']['cubeMasterPM'].forEach(paperMaker=>{
		if(info['paperMakerCode'] == paperMaker['paperMakerCode'])
			paperMakerImage = paperMaker['paperMakerImg'];
	})
	businessInfo[3].style.setProperty('background-image', 'url("/resources/images/paperCompany/' + paperMakerImage + '")');
	businessInfo[3].style.setProperty('background-size', 'contain');
	businessInfo[3].style.setProperty('background-repeat', 'no-repeat');
	businessInfo.forEach((feature) => {itemFeatures[0].appendChild(feature);});
	
	/* 상품 정보 표시 */
	paperInfo[0].innerText = '주문 상품 정보';
	paperInfo[1].appendChild(createDIV(null,'paperName', null));
	paperInfo[1].children[0].appendChild(createDIV(null,'original', null));
	if(info['color'] != null)
    	paperInfo[1].children[0].children[0].innerText = `${info.originalName} (${info['color']['colorName']})`;
	else
    	paperInfo[1].children[0].children[0].innerText = info.originalName;
	paperInfo[1].appendChild(createDIV(null,'weight', null));
	paperInfo[1].children[1].appendChild(createDIV(null,'grammage', null));
	paperInfo[1].children[1].children[0].innerHTML = '<span class=\'big\'>' + info.grammage + '</span>g/㎡';

	/* 시트지/롤지 */
	const paperType = info['packaging'] != 'R/L';
	/* 사이즈-수량-중량 정보 표시 */
	paperInfo[2].appendChild(createDIV(null,'size', null));
	paperInfo[2].children[0].innerText = paperType
		? info.width + 'x' + info.height
		: info.width;

	paperInfo[2].appendChild(createDIV(null,'quantity', null));
	paperInfo[2].children[1].innerHTML = paperType
		?'<span class=\'big\'>' + info.qty + '</span>R'
		:'<span class=\'big\'>' + info.qty + '</span>kg';

	paperInfo[2].appendChild(createDIV(null,'conversionQty', null));
	paperInfo[2].children[2].innerHTML = paperType ?sheetCalculate(info.qty) :`${info['qty']}kg`;

	/* 수량 수정 */
	paperInfo[2].children[1].addEventListener('dblclick', function(){
        cancelCheck('subDialog');
        const orderDialog = createDIV('subDialog', 'orderDialog', '');
        orderDialog.style.top =  (window.pageYOffset + event.target.getBoundingClientRect().bottom + 5) + 'px';
        orderDialog.style.left = (window.pageXOffset + event.target.getBoundingClientRect().left + (event.target.offsetWidth / 3)) +'px';
        //수량 입력 Box
        const qtyBox = createInputBox('text', 'qty', '', '', 'qty');
        // 확인 Btn
        const confirm = createDIV('', 'confirmCheck', null);
        confirm.innerText = '확인'
        // 취소 Btn
        const cancel = createDIV('', 'confirmCheck', null);
        cancel.innerText = '취소'
        cancel.addEventListener('click', (e)=>{cancelCheck('subDialog');});

        confirm.addEventListener('click', ()=>{
            if(qtyBox.value != ''){
				const rollCheck = info['packaging'] != 'R/L';
                info['qty'] = qtyBox.value;
                info['weight'] = rollCheck
					?weightCalculate(info['grammage'], info['width'], info['height'], info['qty'])
					:info['qty'];
                info['sales'] = (price != 0)
					?Math.round(parseFloat(price.replace(',', '')) * (1 - info['discount'] / 100) * parseFloat(info['qty']))
					: 0;
                paperInfo[2].children[1].innerHTML = '<span class=\'big\'>' + info.qty + '</span>';
                paperInfo[2].children[1].innerHTML += rollCheck ?'R' :'Kg';
                paperInfo[2].children[2].innerHTML = rollCheck ?sheetCalculate(info.qty) : info['qty'];
                paperInfo[3].children[2].innerHTML = '매출 ' + '<span class=\'bold big\'> '+ info['sales'].toLocaleString('ko-KR') + '원</span>';
                paperInfo[3].children[3].innerHTML = '중량 ' + '<span class=\'bold big\'> '+ info.weight + '</span>kg';
                const sumLayer = selectHTML('.textLayer');
                let sumWeight = 0, sumPrice = 0, sumQty = 0;
                dataList.forEach(data => {
					sumWeight += parseFloat(data['weight']);
					sumPrice += data['sales'];
					sumQty += parseFloat(data['qty']);
				})
                sumLayer.innerText = `총 수량 : ${sumQty}R 총 중량 : ${sumWeight}kg 예상 매출액 : ${sumPrice.toLocaleString('ko-KR')}원`;
                cancelCheck('subDialog');
			}
        })
        qtyBox.addEventListener('keyup', function(e){if(e.key == 'Enter' && qtyBox.value != ''){confirm.click(); cancel.click();}})
        orderDialog.appendChild(qtyBox);
        orderDialog.appendChild(confirm);
        orderDialog.appendChild(cancel);
        document.body.appendChild(orderDialog);
        qtyBox.focus();
	})

	/* 원지 타입 결정 */		
	let ogType = null;
	if(info.sizeCode.includes('0000')) ogType = 4;
	else if(info.sizeCode.includes('788')) ogType = 0;
	else if(info.sizeCode.includes('636') || info.sizeCode.includes('640')) ogType = 1;
	else if(info.sizeCode.includes('625')) ogType = 2;
	else if(info.sizeCode.includes('890') || info.sizeCode.includes('889')) ogType = 3;
	else ogType = 0;
	/* 고시가격 - 거래처 할인율 - 예상매출 - 중량*/
	appendBadge(paperInfo[3], ['official', 'discount', 'sales', 'weight']);
	const price = (ogType != 4)
		?getNoticePrice(info.ogCode, ogType, info.width, info.height).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		:getNoticePrice(info.ogCode, ogType, info.width, info.height, info['qty']).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	info['price'] = price;
	paperInfo[3].children[0].innerHTML = '고시 ' + '<span class=\'bold big\'> '+ price + '</span>';
	info['discount'] = (info['discount']) ? info['discount'] : 31;
	paperInfo[3].children[1].innerHTML = '할인 ' + '<span class=\'bold big\'> '+ info['discount'] + '%</span>';
	if(document.querySelector('.item.relation.able').dataset['state'] == 'PS1'){
    	paperInfo[3].children[1].addEventListener('dblclick', ()=>{
            cancelCheck('subDialog');
            const orderDialog = createDIV('subDialog', 'orderDialog', '');
            orderDialog.style.top =  (window.pageYOffset + event.target.getBoundingClientRect().bottom + 5) + 'px';
            orderDialog.style.left = (window.pageXOffset + event.target.getBoundingClientRect().left + (event.target.offsetWidth / 3)) +'px';
            //수량 입력 Box
            const qtyBox = createInputBox('text', 'qty', '', '', 'qty');
            // 확인 Btn
            const confirm = createDIV('', 'confirmCheck', null);
            confirm.innerText = '확인'
            confirm.addEventListener('click', ()=>{
                cancelCheck('subDialog');
                info['discount'] = qtyBox.value;
                paperInfo[3].children[1].innerHTML = '할인 ' + '<span class=\'bold big\'> '+ info['discount'] + '%</span>';
                info['sales'] = Math.round(price.replace(',', '') * (1 - info['discount'] / 100) * info['qty']);
                paperInfo[3].children[2].innerHTML = '매출 ' + '<span class=\'bold big\'> '+ info['sales'].toLocaleString('ko-KR') + '원</span>';
            })
            // 취소 Btn
            const cancel = createDIV('', 'confirmCheck', null);
            cancel.innerText = '취소'
            cancel.addEventListener('click', (e)=>{cancelCheck('subDialog');});

            qtyBox.addEventListener('keyup', function(e){if(e.key == 'Enter' && qtyBox.value != ''){confirm.click(); cancel.click();}})
            orderDialog.appendChild(qtyBox);
            orderDialog.appendChild(confirm);
            orderDialog.appendChild(cancel);
            document.body.appendChild(orderDialog);
            qtyBox.focus();
    	})
	}
	if(price != 0) {
		info['sales'] = paperType
			? Math.round(price.replace(',', '') * (1 - info['discount'] / 100) * info['qty'])
			: parseInt(price.replaceAll(',', '')) / 1000 * info['qty'];
	}else info['sales'] = 0;
	paperInfo[3].children[2].innerHTML = '매출 ' + '<span class=\'bold big\'> '+ info['sales'].toLocaleString('ko-KR') + '</span>원';
	paperInfo[3].children[3].innerHTML = (paperType)
		? '중량 ' + '<span class=\'bold big\'> '+ info.weight + '</span>kg'
		: '중량 ' + '<span class=\'bold big\'> '+ info.qty + '</span>kg';

	paperInfo.forEach((feature) => {itemFeatures[1].appendChild(feature);});
    //function createButton(type, value ,cls , click){
	/* 재단 정보 표시 */
	cutInfo[0].innerText = '재단 정보';
    const paperCutCallBtn = createButton('button', '입력', 'inputBtn');
    cutInfo[0].appendChild(paperCutCallBtn);
    paperCutCallBtn.addEventListener('click', ()=>{
		if(ogType < 4) paperCutController(cutInfo[1], ogType, info, idx);
		else{
			cutInfo[1].innerHTML = '';
			const autoCutSpec = [
				createInputBox('text', '', null, '재단절수', 'searchPart'),
				createInputBox('text', '', null, '가로', 'searchPart'),
				createInputBox('text', '', null, '세로', 'searchPart'),
			]
			autoCutSpec.forEach(((cutSpec, cutSpecIdx)=>{
				cutInfo[1].appendChild(cutSpec);
				cutSpec.addEventListener('blur', ()=>{
					if(autoCutSpec[0].value != '' && autoCutSpec[1].value != '' && autoCutSpec[2].value != ''){
						info['isCut'] =
							`${autoCutSpec[0].value}|${setString2(autoCutSpec[1].value)}${setString2(autoCutSpec[2].value)}`;
					}
				})
				if(cutSpecIdx != autoCutSpec.length -1){
					cutSpec.addEventListener('keyup', (e)=>{
						if(e.key == 'Enter') autoCutSpec[cutSpecIdx+1].focus();
					})
				}
			}))
			autoCutSpec[0].focus();
		}
    })
	const paperCutDeleteBtn = createButton('button', '삭제', 'inputBtn');
	cutInfo[0].appendChild(paperCutDeleteBtn);
	paperCutDeleteBtn.addEventListener('click', ()=>{
		cancelCheck('paperCutPopup');
		cutInfo[1].innerHTML = '';
		info['isCut'] = 0;
	})

	cutInfo.forEach((feature) => {itemFeatures[2].appendChild(feature);});
	
	/* 비용 정보 표시 */
	// costInfo[0].innerText = '비용 정보';
	// costInfo[1].appendChild(createInputBox('text', 'cost', null, '하차비', 'searchPart'));
	// costInfo.forEach((feature) => {itemFeatures[3].appendChild(feature);});
	
	/* 비고 정보 표시 */
	commentInfo[0].addEventListener('keyup', function(e){if(e.key == 'Enter') commentInfo[1].focus();})

    commentInfo[2].setAttribute('readonly', true);
    commentInfo[2].value = info['mappingCode'];
	commentInfo[2].addEventListener('dblclick', () => {
		if(commentInfo[2].getAttribute('readonly'))	commentInfo[2].removeAttribute('readonly');
		else commentInfo[2].setAttribute('readonly', true);
	});
	commentInfo.forEach((feature) => {itemFeatures[4].appendChild(feature);});
	
	
	itemFeatures.forEach((feature) => { item.appendChild(feature);});
}

/**
 * :고시가격 탐색하기
 * @param 	{ogCode : string}
 * */
function getNoticePrice(ogCode, sizeCode, width, height, qty){
	const ogList = cubeJsonData[0]['cubeMasterKey'].cubeMasterOG;
	let size = null, result = 0;
	
	if(sizeCode == 0) size = 'noticePrice';
	else if(sizeCode == 1 || sizeCode == 2) size = 'noticePrice2';
	else if(sizeCode == 4) size = 'noticePrice3';
	else if(sizeCode == 3) size = 'noticePrice4';
	for(let idx = 0; idx < ogList.length; idx++){
		if(ogList[idx].originalCode == ogCode) {
			result = (height != '000')
			? Math.round((ogList[idx][size] / ((788 / 1000) * (1091 / 1000))) * ((width / 1000) * (height / 1000)) / 10) * 10
			: Math.round(ogList[idx][size]);
		}
	}
	
	return result;
}

function paperCutController(htmlObject, ogType, ogSpec, productIdx){
	if(document.querySelector('#paperCutPopup')) {
		cancelCheck('paperCutPopup');
		return;
	}

	const cutStandard = [  [['1절', 788, 1091, 1], ['2절', 788, 543, 2], ['4절', 391, 542, 4], ['5절', 424, 361, 5], ['7절', 543, 216, 7],
						  	['8절', 391, 270, 8], ['9절', 361, 261, 9], ['11절', 345, 216, 11], ['12절', 270, 261, 12], ['13절', 283, 216, 13],
						  	['14절', 270, 216, 14], ['15절', 260, 216, 15], ['16절', 270, 195, 16], ['36절', 180, 126, 36]], 
						   [['장6절', 543, 260, 6], ['장8절', 543, 195, 8], ['장10절', 391, 216, 10], 
							['정3절', 788, 361, 3], ['정5절', 453, 331, 5], ['정6절', 391, 361, 6], ['정10절', 315, 225, 10],
							['T3절', 695, 391, 3], ['T6절', 272, 515, 6]],
						   [['A4', 297, 210, 0], ['B4', 363, 257, 0], ['B5', 181, 257, 0]],
						   [['국1절', 636, 939, 1], ['국2절', 636, 466, 2], ['국3절', 636, 311, 3], ['국4절', 466, 315, 4], 
							['국6절', 450, 210, 6], ['국8절', 315, 233, 8], ['국9절', 310, 210, 9], ['국12절', 210, 230, 12],
							['A3', 420, 297, 4], ['A4', 297, 210, 9]],
						   [['1절', 880, 625, 1], ['2절', 438, 625, 2], ['4절', 438, 310, 4], ['8절', 219, 310, 8], ['A3', 420, 297, 4]],
						   [['2절', 890,  600, 2], ['4절', 445, 600, 4], ['장6절', 296, 597, 6]],
    ];

	cubeJsonData[1]['cutStandard'] = cutStandard;
    const cutGroup = [[0, 1, 2, 6], [3, 6], [4, 6], [5, 6]];
	const paperCutCtl = createDIV('paperCutPopup',null, null);
	paperCutCtl.appendChild(createDIV(null,'selectionLayer', null));
	paperCutCtl.appendChild(createDIV(null,'listLayer', null));
	const headers = [createDIV(null,'header name', null), createDIV(null,'header width', null), createDIV(null,'header height', null), createDIV(null,'header sheets', null)];
    paperCutCtl.children[1].appendChild(createDIV(null,'headers', null));
    const headerTexts = ['재단절수', '재단가로', '재단세로', '절수'];
	headers.forEach((header, idx) => {
		paperCutCtl.children[1].appendChild(createDIV(null,'recordsP', null));
		header.innerText = headerTexts[idx];
		paperCutCtl.children[1].children[0].appendChild(header);
	});
	/* 원지 종류에 따른 재단 사이즈 분류 버튼 생성 */
	switch (ogType){
	    case 0:
            appendBadge(paperCutCtl.children[0], ['selectionBtn', 'selectionBtn', 'selectionBtn', 'selectionBtn']);
            paperCutCtl.children[0].children[0].innerText = '4X6 기본재단'; // cutStandard[0];
            paperCutCtl.children[0].children[1].innerText = '정/장/T 재단'; // cutStandard[1];
            paperCutCtl.children[0].children[2].innerText = '복사용지'; // cutStandard[2];
            paperCutCtl.children[0].children[3].innerText = '닷지'; // cutStandard[2];
            break;
        case 1:
            appendBadge(paperCutCtl.children[0], ['selectionBtn', 'selectionBtn']);
            paperCutCtl.children[0].children[0].innerText = '6X9 기본재단'; // cutStandard[3];
            paperCutCtl.children[0].children[1].innerText = '닷지'; // cutStandard[3];
            break;
        case 2:
            appendBadge(paperCutCtl.children[0], ['selectionBtn', 'selectionBtn']);
            paperCutCtl.children[0].children[0].innerText = '8X6 기본재단'; // cutStandard[4];
            paperCutCtl.children[0].children[1].innerText = '닷지'; // cutStandard[4];
			break;
		case 3:
			appendBadge(paperCutCtl.children[0], ['selectionBtn', 'selectionBtn']);
			paperCutCtl.children[0].children[0].innerText = '하드롱 기본재단'; // cutStandard[4];
			paperCutCtl.children[0].children[1].innerText = '닷지'; // cutStandard[4];
			break;
	}
    const selectionBtns = paperCutCtl.querySelectorAll('.selectionLayer .item');
    const records = paperCutCtl.querySelectorAll('.listLayer .recordsP');

	for(const [idx, selectionBtn] of selectionBtns.entries()){
	    if(cutGroup[ogType][idx] != 6){
	        const autoCutSpec = [
	            createInputBox('text', '', null, '재단절수', 'searchPart'),
	            createInputBox('text', '', null, '가로', 'searchPart'),
	            createInputBox('text', '', null, '세로', 'searchPart'),
	        ]

				// 종|횡목 체크 0 - 종목, 1 - 횡목
			let paperDirection = null;
			for(let standard of cutStandard[cutGroup[ogType][idx]]){
				if(!paperDirection){
					paperDirection = ogSpec['sizeCode'].substring(0,4) == standard[1] ?0 :1;
					break;
				}
			}

            cutStandard[cutGroup[ogType][idx]].forEach(standard=>{
                const record = createDIV(null, 'record', null);
                record.addEventListener('click', ()=>{
                    htmlObject.innerHTML = '';

                    autoCutSpec.forEach((input, specIdx)=>{
                        input.value = standard[specIdx]
                        htmlObject.appendChild(input);
                    })

                    tempSelectDatas['product'][productIdx]['isCut'] =
	                    `${standard[0]}|${setString2(standard[1].toString())}${setString2(standard[2].toString())}|00000000`;

                })
                records[idx].appendChild(record);
				if(paperDirection == 0){
					standard.forEach(spec=>{
						const specDiv = createDIV('', 'row', null);
						specDiv.innerText = spec;
						record.appendChild(specDiv);
					})
				}else{
					const specDivs = [
						createDIV('', 'row', null),
						createDIV('', 'row', null),
						createDIV('', 'row', null),
						createDIV('', 'row', null)
					]
					specDivs.forEach(div=>{
						record.appendChild(div);
						record.appendChild(div);
					})
					specDivs[0].innerText = standard[0];
					specDivs[1].innerText = standard[2];
					specDivs[2].innerText = standard[1];
					specDivs[3].innerText = standard[3];
				}
            })

			autoCutSpec.forEach(cutSpec=>{
				cutSpec.addEventListener('keyup', function(e){
					if(e.key == 'Enter'){
						tempSelectDatas['product'][productIdx]['isCut'] =
							`${autoCutSpec[0].value}|${setString2(autoCutSpec[1].value)}${setString2(autoCutSpec[2].value)}|00000000`;
					}
				})

				cutSpec.addEventListener('blur', function(e){
					if(autoCutSpec[1].value != '' && autoCutSpec[2].value != ''){
						tempSelectDatas['product'][productIdx]['isCut'] =
							`${autoCutSpec[0].value}|${setString2(autoCutSpec[1].value)}${setString2(autoCutSpec[2].value)}|00000000`;
					}
				})
			})

	    }else{
	        const manualCutSpec = [
	            createInputBox('text', '', null, '절수', 'searchPart'),
	            createInputBox('text', '', null, '가로', 'searchPart'),
	            createInputBox('text', '', null, '세로', 'searchPart'),
	            createInputBox('text', '', null, '가로', 'searchPart'),
	            createInputBox('text', '', null, '세로', 'searchPart'),
	        ]
	        selectionBtn.addEventListener('click', ()=>{
                htmlObject.innerHTML = '';
				const cutCount = createDIV('', 'cutCount');
				htmlObject.appendChild(cutCount)
				cutCount.appendChild(manualCutSpec[0]);

				const cutInputDiv = createDIV('', 'cutInput');
				htmlObject.appendChild(cutInputDiv)

                manualCutSpec.slice(1).forEach(input=>{
					cutInputDiv.appendChild(input);
                })
	        })

			manualCutSpec.forEach((cutSpec, cutSpecIdx)=>{
				cutSpec.addEventListener('keyup', function(e){
					let validCheck = true;
					manualCutSpec.forEach(input=>{
						if(input.value == '') validCheck = false;
					})
					if(e.key == 'Enter' && validCheck){
						if(cutSpecIdx != manualCutSpec.length-1) manualCutSpec[cutSpecIdx+1].focus();
						const cut = manualCutSpec[0].value + '|' + setString2(manualCutSpec[1].value) +
							setString2(manualCutSpec[2].value) + '|' + setString2(manualCutSpec[3].value) +
							setString2(manualCutSpec[4].value);
						tempSelectDatas['product'][productIdx]['isCut'] = cut;
					}
				})

				cutSpec.addEventListener('blur', function (e){
					let validCheck = true;
					manualCutSpec.forEach(input=>{
						if(input.value == '') validCheck = false;
					})
					if(validCheck){
						const cut = manualCutSpec[0].value + '|' + setString2(manualCutSpec[1].value) +
							setString2(manualCutSpec[2].value) + '|' + setString2(manualCutSpec[3].value) +
							setString2(manualCutSpec[4].value);
						tempSelectDatas['product'][productIdx]['isCut'] = cut;
					}
				})
			})
	    }

	    selectionBtn.addEventListener('click', function(){
	        for(const [recordIdx, record] of records.entries()){
                if(recordIdx != idx) record.style.setProperty('display', 'none');
                else record.style.setProperty('display', 'flex');
	        }
	    })
	}

	htmlObject.appendChild(paperCutCtl);
	selectionBtns[0].click();
}

function setBusinessInfo(){
	
}

function onDragStart(e){
	const node = e.currentTarget;
	node.parentElement.classList.add('dragging');
}

function onDragOver(e){
	e.preventDefault();
	const node = e.currentTarget;
	const dragging = document.querySelector('.dragging');
	const curY = dragging.offsetTop;
	const siblings = [ ...document.querySelectorAll('.itemLayer:not(.dragging)') ];
	
	const nextSibling = siblings.find(sibling =>{
		if(curY > node.offsetTop){
			return node.offsetTop <= sibling.offsetTop + sibling.offsetHeight/2;
		} else{
			return node.offsetTop <= sibling.offsetTop - sibling.offsetHeight/2;
		}
		
	});
	document.querySelector('.listLayer').insertBefore(dragging, nextSibling);
}

function onDrop(e){
	console.log(e);
	const itemLayerList = document.querySelectorAll('.itemLayer');
	itemLayerList.forEach((el, i, arr)=>{
		el.classList.remove('dragging');
		const dataIdx = el['dataset']['index'];
		if(dataIdx != i){
			[tempSelectDatas['product'][dataIdx], tempSelectDatas['product'][i]] =
			[tempSelectDatas['product'][i], tempSelectDatas['product'][dataIdx]];
			itemLayerList[dataIdx].setAttribute('data-index', dataIdx);
		}
	})
}

/* 거래처 메모
 * @param {...any} param
 */
function getPartnerMemoList(...param){
	let params = [];
	if(param.length > 0){
		params = [
			[param[0],'noticeRegEmCode'],
			[cubeJsonData[0].cubeMasterKey.cubeMasterEM,'employeeCode'],
			['employeeName']
		];
		cubeJsonData[1]['selectNoticeByPartner'] = getRefinDatas(params);
		const columns = [
			['등록자', 'employeeName', '15%', 'center'],
			['내용', 'prNotice', '85%', 'left'],
			[
			 []
			],
			['modMemo']
		];
		makeCubeGridInWorkBoard(selectHTML().children[4], columns, 'selectNoticeByPartner', true, true);
	}

}

/** modMemo
 * : 메모 삭제 및 수정
 * @param	{JSON} 선택한 메모 data
 * @param	{HTMLNode} 선택한 row HTML
 * */
function modMemo(...param){
	const deliveryType = document.querySelector('#om10 > div:nth-child(2) > div.content > div > div.searchLayer > div').children[0];
	const boxInfo = [[param[0].prNotice, '내용', 'long', false]];
	let btnInfo = null;

	if(param[0]['noticeRegEmCode'] == cubeJsonData[0]['employee']['employeeCode']){
	    btnInfo = [
            [null, 'confirmCheck triple', 'memoModify(\''+ JSON.stringify(param[0]) + '\')', '수정'],
            [null, 'confirmCheck triple', 'memoDelete(\''+ JSON.stringify(param[0]) + '\')', '삭제'],
            [null, 'confirmCheck triple', 'cancelFunc(this)', '취소']
	    ];
	    popupContoller(boxInfo, btnInfo, param[1], [1.5, 1]);
	}
}

function memoRefresh(...param){
    const formData = new FormData();
    formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
    serverCallByFetchAfterAuth(formData, '/OM10REFRESHMEMO', 'post', 'modMemoCallBack');
}

// 메모 등록 팝업
function memoRegisterPopup(){
	const boxInfo = [[null, '내용', 'long', false]];
    btnInfo = [
        [null, 'confirmCheck double', 'memoRegister(this, 0)', '등록'],
        [null, 'confirmCheck double', 'cancelFunc(this)', '취소']
    ];
    popupContoller(boxInfo, btnInfo, selectHTML('div:nth-child(5) > div.badge > div.addBtn.plus'), [1.5, 1]);
}

/* 메모 등록, 수정, 삭제 Callback
 * @param[0]  {JSON} 결과
 */
function modMemoCallBack(...param){
    cancelCheck('popupDialog');
    getPartnerMemoList(param[0]['selectNoticeByPartner']);
}

function memoRegister(...param){
    const formData = new FormData();
    formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
    formData.append('partnerNotice', param[0].previousSibling.value);
    formData.append('employeeCode', cubeJsonData[0]['employee']['employeeCode']);
    formData.append('modMemoType', param[1]);
    cancelCheck('popupDialog');
    serverCallByFetchAfterAuth(formData, '/OM10MODMEMO', 'post', 'modMemoCallBack', param[1]);
}

function memoModify(...param){
	const popupDialog = document.querySelector('#popupDialog');
    const data = JSON.parse(param[0]);
    const formData = new FormData();
    formData.append('modMemoType', 1);
    formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
    formData.append('partnerNotice', popupDialog.children[0].value);
    formData.append('partnerNoticeDate', data['prNoticeDate']);
    serverCallByFetchAfterAuth(formData, '/OM10MODMEMO', 'post', 'modMemoCallBack', 1);
}

function memoDelete(...param){
    const data = JSON.parse(param[0]);
    const formData = new FormData();
    formData.append('modMemoType', 2);
    formData.append('partnerNoticeDate', data['prNoticeDate']);
    formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
    serverCallByFetchAfterAuth(formData, '/OM10MODMEMO', 'post', 'modMemoCallBack', 2);
}

//function modMemoCtl(...param){
//    const formData = new FormData();
//    formData.append('partnerCode', tempSelectDatas['info']['partner']['partnerCode']);
//    formData.append('partnerNotice', param[0].previousSibling.value);
//    formData.append('employeeCode', cubeJsonData[0]['employee']['employeeCode']);
//    formData.append('modMemoType', param[1]);
//    if(param[1] != 0){
//        const [employeeCode, prNoticeDate, prCode] = param[2].split('|');
//        formData.append('partnerNoticeDate', prNoticeDate);
//        const msg = (param[1] == 1) ?'본인의 메모만 수정 가능합니다.' :'본인의 메모만 삭제 가능합니다.';
//        if(employeeCode != cubeJsonData[0]['employee']['employeeCode']){
//            alert(msg); return;
//        }
//    }
//    cancelCheck('popupDialog');
//    serverCallByFetchAfterAuth(formData, '/OM10MODMEMO', 'post', 'modMemoCallBack', param[1]);
//}

/* 매출 리스트 호출
 * @param[0] {Array} saleList
 */
function getSaleList(...param){
	const contents = selectHTML().children[5].children[1].children[0];
	let params = [];

	if(param[0].length > 0){
		params = [
			[param[0],'edPtcode'],
			[cubeJsonData[0].cubeMasterKey.cubeMasterOG,'originalCode'],
			['originalName','paperMakerName']
		];

		cubeJsonData[1]['selectSaleList'] = getRefinDatas(params);

		const columns = [
			['상품명', 'originalName', '50%', 'left'],
			['제지사', 'paperMakerName', '50%', 'left'],
			[
			 ['매출상세코드', 'edSecode', '50%', 'left']
			],
			['']
		];
		makeCubeGridInWorkBoard(contents.children[1], columns,'selectSaleList', true , true);
	}
}

/* matchData's name
 * @param  {...any} param
 */
function getRefinDatas(...param){
	const matchDatas = [];
	for(let idx = 0; idx < param[0][0][0].length; idx++){
		for(let index = 0; index < param[0][1][0].length; index++){
			if(param[0][1][0][index][param[0][1][1]] == param[0][0][0][idx][param[0][0][1]].substr(0,8)){
				for(let insertIndex = 0; insertIndex < param[0][2].length; insertIndex++){
					param[0][0][0][idx][param[0][2][insertIndex]] = param[0][1][0][index][param[0][2][insertIndex]];
				}
				matchDatas.push(param[0][0][0][idx]);
			}

		}
	}
	console.log(matchDatas);
	return matchDatas;
}

/* 출고 리스트 호출
 * @param[0] {Array} saleList
 */
function getReleaseList(...param){
	const contents = selectHTML().children[5].children[1].children[0];

	if(param[0].length > 0){

		const columns = [
			['출고목록', 'originalName', '100%', 'left'],
			[
			 ['매출상세코드', 'edSecode', '50%', 'left']
			],
			['']
		];
		makeCubeGridInWorkBoard(contents.children[2], columns,'selectReleaseStatus', true);
	}
}

/* 주문서 QuickSearch 상품 Grid row Onclick
 * @param[0]  {String} jsonDataKey
 * @param[1]  {Int} jsonDataIdx
 * @param[2]  {Array} HiddenData
 */


/* 주문상품 갱신 및 셋팅 */
function saveGoods(...param){
	!confirm('추가하시겠습니까?')? console.log('reset') : createOrderDetail(canvasBox[idx].children[4],tempSelectDatas);
}

/** 납품처 Insert
 *
 */
function savePartnerBtn(){
	const formData = new FormData();
	const saveDatas = selectHTML('input[name="delivery-input"]', true);

	formData.append('dpCode', saveDatas[1].value);
	formData.append('dpPrcode', om10PrCode);
	formData.append('dpName', saveDatas[0].value);
	formData.append('dpPhone', saveDatas[1].value);
	formData.append('dpAddr', saveDatas[2].value);
	formData.append('dpEmcode', cubeJsonData[0].employee.employeeCode);

//	successInsert(0);
	/* ServerCall >> JSON */
	serverCallByFetchAfterAuth(formData, '/INSERTDELIVERYPLACE', 'post', 'successInsert', ['','']);
}

/** 납품처 Insert CallBack
 * @param[0] {String} 결과
 */
function successInsert(...param){
	param[0].insertDeliveryPlace == '1' ? alert('납품처가 등록되었습니다.') : '';

	/* Input Value 초기화 */
	const saveDatas = selectHTML('input[name="delivery-input"]', true);

	/* 데이터 재호출 */
	getDeliveryList(om10PrCode, saveDatas);

	for(let idx = 0; idx < saveDatas.length; idx++){
		saveDatas[idx].value = '';
	}
	const div = selectHTML('.deliveryDiv');
	div.remove();

	/* BoardSpec 수정 */
	const workSpace = canvasBox[idx].children[1];
	workSpace.setAttribute('style','grid-area: 1 / 4 / 3 / 5');

	const content = workSpace.children[1];
	content.style = '';

	/* 저장 클릭 시 + 버튼 보이게 */
	selectHTML('.addBtn').style = '';
}

/* 상세 주문리스트 */
function createOrderDetail(...param){

	const product = createDIV('', 'product', '');
	const productBadge = createDIV('', 'productBadge', '');

	const addCopy = createDIV('', 'addCopy', '');
	addCopy.innerText = '＋';
	productBadge.appendChild(addCopy);
	const removed = createDIV('', 'removed', '');
	removed.addEventListener('click', ()=>{
		removeOrderDetail(document.getElementsByClassName('product').length);});
	removed.innerText = '－';
	productBadge.appendChild(removed);

	product.appendChild(productBadge);
	const productContent = createDIV('', 'productContent', '');
	productContent.style.setProperty('display','flex');

	const div = [
		['originalName','20%'],
		['grammage','15%'],
		['width','15%'],
		['height','15%'],
		['qty','15%'],
		['paperMakerName','20%'],
	];

	for(let idx = 0; idx < div.length; idx++){
		let name = div[idx];
		name = createDIV('',div[idx],'');
		name.innerText =  param[1][param[1].length-1][div[idx][0]];
		name.style.setProperty('width',div[idx][1]);
		productContent.appendChild(name);
	}
	product.appendChild(productContent);
	param[0].children[1].children[0].appendChild(product);

}

/* 상세 주문리스트 삭제 */
function removeOrderDetail(idx){
	const orderDetail = document.getElementsByClassName('product');
	console.log(idx);
	orderDetail[idx].remove();
}

/**searchMatchList
 * : 리스트 중 특정 납품처 찾기
 * @param 	{string: word}
 * @param 	{Object: dataList}
 * @param	{string: savingKeyword}
 * @param	{Array: searchFieldList}
 * @param 	{HTML Object: displayLocation}
 *
 */
function searchMatchList(word, dataList, savingKeyword, searchFieldList, displayLocation){
	// 검색어 정규식 패턴으로 변형
	const regPattern = word.toLowerCase().split('').map(makeFuzzyPatten).map((regPattern) => '(' + regPattern + ')').join('.*?');
	const searchRegex = new RegExp(regPattern);

	// 리스트 중 word와 일치하는 리스트 필터링
	const matchDataList = dataList.filter((record) => {
		let targetWords = '';
		searchFieldList.forEach((field)=>{targetWords += record[field].toLowerCase();});
		return searchRegex.test(targetWords);
	});

	cubeJsonData[1][savingKeyword] = matchDataList;
}
