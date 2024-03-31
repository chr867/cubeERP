package com.sinseungpaper.cube.Services;

import com.sinseungpaper.cube.beans.*;
import com.sinseungpaper.cube.common.TransactionAssistant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
@Slf4j
public class OrderMgrServ extends TransactionAssistant{
	public void orderMgrServCtl(Model model, String serviceCode) {
		switch(serviceCode) {
			case "T01": this.initOrderingSystem(model);	break;
			case "P01": this.getPartnerCreditInfo(model, true); break;
			case "P02": this.getPartnerMemoList(model, true); break;
			case "P03": this.getThreeMonthSalesInfo(model, true); break;
			case "M01": this.modMemoCtl(model); break;
			case "DP01": this.getPartnerDeliveryPlace(model); break;
			case "DP02": this.modDpCtl(model); break;
			case "O01": this.insertOrder(model); break;
		}
	}

	/** initOrderingSystem
	 *	: QuickSearch를 통한 출하 요청 후 주문서에 표시할 전체 데이터
	 * @param model		<OrderMgrReq> clinetData,  <OrderMgrRes> serverData
	 */
	private void initOrderingSystem(Model model) {
		try {
			this.tranStart(true);
			/* 거래처 신용 정보 */
			this.getPartnerCreditInfo(model, false);
			/* 거래처 특이사항 메모 정보 */
			this.getPartnerMemoList(model, false);
			/* 거래처 최근 3개월 매출 정보 */
			this.getThreeMonthSalesInfo(model, false);
			/* 전일, 당일 출고 정보 */
			this.getOrderProcessingStatus(model, false);
			this.commit();
		}catch(Exception e) { e.printStackTrace();
		}finally {
			this.tranEnd();
		}
	}

	/** getPartnerCreditInfo
	 *	: 주문에 필요한 거래처의 신용정보 수집
	 * @param model		<OrderMgrReq> clinetData,  <OrderMgrRes> serverData
	 */

	private void getPartnerCreditInfo(Model model, boolean isRefresh) {
		OrderMgrRes oms = new OrderMgrRes();
		OrderMgrReq omg = (OrderMgrReq)model.getAttribute("clientData");
		try {
			if(isRefresh){
				this.tranStart(true);
			}
			oms.setPartnerCreditInfo((PartnerCreditB)cubeSession.selectList("getPartnerCreditInfo", omg.getPartnerCode()).get(0));
			/* ORDERABLEAMOUNT, OUTSTANDIGBALANCE 계산 */
			int totalBalance = 0;
			for(OutstandingAmountB balance: oms.getPartnerCreditInfo().getOutstandingList()) {
				totalBalance += balance.getBalanceAmount();
			}
			oms.getPartnerCreditInfo().setOrderableAmount(
					(oms.getPartnerCreditInfo().getCreditLimit() == 3999999999L)? -1 : oms.getPartnerCreditInfo().getCreditLimit() - totalBalance);
			oms.getPartnerCreditInfo().setOutstandingBalance(totalBalance);

			/* OrderMgrRes에 담기 */
			model.addAttribute("serverData", oms);

			if(isRefresh) {this.commit();}
		}catch(Exception e) {e.printStackTrace();
			this.rollback();
		}finally {
			if(isRefresh) this.tranEnd();
		}
	}
	/** getPartnerMemoList
	 *	: 특정 거래처의 메모리스트 수집
	 * @param model		<OrderMgrReq> clinetData,  <OrderMgrRes> serverData
	 */
	private void getPartnerMemoList(Model model, boolean isRefresh) {
		OrderMgrReq omg = (OrderMgrReq)model.getAttribute("clientData");
		OrderMgrRes oms = new OrderMgrRes();
		try {
			if(isRefresh) {
				this.tranStart(true);
			}else oms = (OrderMgrRes)model.getAttribute("serverData");
			oms.setSelectNoticeByPartner(cubeSession.selectList("selectNoticeByPartner", omg));
			/* OrderMgrRes에 담기 */
			model.addAttribute("serverData", oms);
			if(isRefresh) {this.commit();}
		}catch(Exception e) {e.printStackTrace();
			this.rollback();
		}finally {
			if(isRefresh) this.tranEnd();
		}
	}

	/** getThreeMonthSalesInfo
	 *	: 특정 거래처의 최근 3개월 간 매출정보(지종 중심)
	 * @param model		<OrderMgrReq> clinetData,  <OrderMgrRes> serverData
	 */
	private void getThreeMonthSalesInfo(Model model, boolean isRefresh) {
		OrderMgrRes oms = new OrderMgrRes();
		if((OrderMgrRes)model.getAttribute("serverData") != null)
			oms = (OrderMgrRes)model.getAttribute("serverData");
		OrderMgrReq omg = (OrderMgrReq)model.getAttribute("clientData");
		try {
			if(isRefresh) {
				this.tranStart(true);
			}
			oms.setSelectSaleByPartner(cubeSession.selectList("selectSaleByPartner", omg));
			if(isRefresh) {this.commit();}
		}catch(Exception e) {e.printStackTrace();
			this.rollback();
		}finally {
			if(isRefresh){
				this.tranEnd();
				model.addAttribute("serverData", oms);
			}
		}
	}
	/** getOrderProcessingStatus
	 *	: 주문 처리자 중심의 전일, 당일 처리 현황
	 * @param model		<OrderMgrReq> clinetData,  <OrderMgrRes> serverData
	 */
	private void getOrderProcessingStatus(Model model, boolean isRefresh) {
		OrderMgrRes oms = new OrderMgrRes();
		if((OrderMgrRes)model.getAttribute("serverData") != null)
			oms = (OrderMgrRes)model.getAttribute("serverData");
		OrderMgrReq omg = (OrderMgrReq)model.getAttribute("clientData");
		try {
			if(isRefresh) {
				this.tranStart(true);
			}
			oms.setSelectReleaseStatus(cubeSession.selectList("selectReleaseStatus", omg));
			if(isRefresh) {this.commit();}
		}catch(Exception e) {e.printStackTrace();
			this.rollback();
		}finally {
			if(isRefresh){
				this.tranEnd();
				model.addAttribute("serverData", oms);
			}
		}
	}

	private void modMemoCtl(Model model){
		OrderMgrRes oms = new OrderMgrRes();
		OrderMgrReq omg = (OrderMgrReq)model.getAttribute("clientData");
		try {
			this.tranStart(false);
			switch (omg.getModMemoType()){
				case 0: cubeSession.insert("insertMemo", omg); break;
				case 1: cubeSession.update("updateMemo", omg); break;
				case 2: cubeSession.delete("deleteMemo", omg); break;
			}
			oms.setSelectNoticeByPartner(cubeSession.selectList("selectNoticeByPartner", omg.getPartnerCode()));
			this.commit();
		}catch(Exception e) { e.printStackTrace();
			this.rollback();
		}finally {
			this.tranEnd();
			model.addAttribute("serverData", oms);
		}
	}

	private void getPartnerDeliveryPlace(Model model) {
		OrderMgrRes oms = new OrderMgrRes();
		OrderMgrReq omg = (OrderMgrReq)model.getAttribute("clientData");
		try {
			this.tranStart(true);
			List<MasterVersionB> vc = cubeSession.selectList("getMasterVersion");
			if(vc.get(5).getVcVersion() != omg.getPdVersion()){
				oms.setDeliveryPlaces(cubeSession.selectList("getDPInfo"));
				oms.setUpdateDpVersion(vc.get(5).getVcVersion());
			}
			if(vc.get(8).getVcVersion() != omg.getDpVersion()){
				oms.setPartnerDeliveryPlaces(cubeSession.selectList("getPDInfo"));
				oms.setUpdatePdVersion(vc.get(8).getVcVersion());
			}
			this.commit();
		}catch(Exception e) { e.printStackTrace();
			this.rollback();
		}finally {
			this.tranEnd();
			model.addAttribute("serverData", oms);
		}
	}

	private void modDpCtl(Model model) {
		OrderMgrRes oms = new OrderMgrRes();
		OrderMgrReq omg = (OrderMgrReq)model.getAttribute("clientData");
		try {
			this.tranStart(false);
			if(omg.getDpPhone() != null)
				omg.setDpPhone(omg.getDpPhone().replace("-", ""));
			switch(omg.getModDpType()){
				case 0:
					cubeSession.insert("insertDP", omg);
					oms.setDeliveryPlaces(cubeSession.selectList("getDPInfo"));
					cubeSession.update("updateDpVc");
					break;
				case 1:
					cubeSession.insert("insertPD", omg);
					oms.setPartnerDeliveryPlaces(cubeSession.selectList("getPDInfo"));
					cubeSession.update("updatePdVc");
					break;
				case 2:
					cubeSession.delete("deletePD", omg);
					oms.setPartnerDeliveryPlaces(cubeSession.selectList("getPDInfo"));
					cubeSession.update("updatePdVc");
					break;
				case 3:
					cubeSession.update("updateDP", omg);
					oms.setDeliveryPlaces(cubeSession.selectList("getDPInfo"));
					oms.setPartnerDeliveryPlaces(cubeSession.selectList("getPDInfo"));
					cubeSession.update("updatePdVc");
					cubeSession.update("updateDpVc");
					break;
			}
			List<MasterVersionB> vc = cubeSession.selectList("getMasterVersion");
			if(omg.getPdVersion() != 0 && vc.get(5).getVcVersion() != omg.getPdVersion()) oms.setUpdatePdVersion(vc.get(5).getVcVersion());
			if(omg.getDpVersion() != 0 && vc.get(8).getVcVersion() != omg.getDpVersion()) oms.setUpdateDpVersion(vc.get(8).getVcVersion());
			this.commit();
		}catch(Exception e) {
			e.printStackTrace();
			this.rollback();
		}finally {
			this.tranEnd();
			model.addAttribute("serverData", oms);
		}
	}

	private void insertOrder(Model model) {
		OrderMgrRes oms = new OrderMgrRes();
		OrderMgrReq omg = (OrderMgrReq)model.getAttribute("clientData");
		OrderB orderB = omg.getOrder();
		log.info("{}", orderB);
		boolean result = false;
		try {
/*			insertType
				0 >> 자사 매입 (발주, 입고)
				1 >> 매입 직송 (발주)
				2 >> 자사 입고 후 출고 (발주, 입고, 출고)
				3 >> 자사 출고 (출고)
				4 >> 자사 이관 (입고, 이관, 출고)
				5 >> 자사 이관 후 출고 (입고, 이관, 출고, 출고)
			stockType
				-1 >>> 정상,주문, 공용
				0  >>> 매입 잡은 거래처의 주문
				1  >>> 매입 없는 거래처의 주문
			orderType
				0 >> 매입 제지사 재고 (insertType)
				1 >> 매출 자사 재고 (주문, 출고)
				2 >> 지업사 지업사 주문 (insertType)
*/
			ArrayList<OrderDetail> buyList = new ArrayList<>();  // 발주
			ArrayList<OrderDetail> orderList = new ArrayList<>(); // 주문
			ArrayList<OrderDetail> warehousingList = new ArrayList<>(); // 입고
			ArrayList<OrderDetail> releaseList = new ArrayList<>(); // 출고
			ArrayList<OrderDetail> moveList = new ArrayList<>(); // 이관
			BuyB buyB = new BuyB(); ReleaseB releaseB = new ReleaseB(); WarehousingB warehousingB = new WarehousingB();
			StockMoveB moveB = new StockMoveB();
			boolean warehousing = false, lgort = false;
			OrderDetail lgortBean = null;
			String orCode = null, releaseCode = null, buyCode = null, warehousingCode = null,
					purchasePartner = null, lgortReleaseCode = null, moveCode = null;
			float warehosuingSumWeight = 0, lgortQty = 0, lgortWeight = 0;
			for(OrderDetail od: orderB.getOrderDetail()){
				if(od.getOrderPartnerCode().equals("1248100815") || od.getOrderPartnerCode().equals("1048658322")){
					od.setQty((!od.getPackagingCode().equals("OW3"))
							?String.valueOf(Float.parseFloat(od.getQty()) * 500) :od.getWeight());
				}else{
					od.setQty((!od.getPackagingCode().equals("OW3"))
							?String.valueOf(Float.parseFloat(od.getQty()) * 500) :od.getQty());
				}
				orderList.add(od);
			}
			this.tranStart(false);
			for(OrderDetail od: orderB.getOrderDetail()) {
				if(cubeSession.selectList("productCheck", od.getProductCode()).isEmpty()){
					if(cubeSession.selectList("sizeCheck", od.getProductCode().substring(8)).isEmpty()){
						HashMap<String, String> args = new HashMap<>();
						args.put("sizeCode", od.getProductCode().substring(8));
						args.put("sizeWidth",
								od.getProductCode().charAt(8) == '0'
										?od.getProductCode().substring(9, 12)
										:od.getProductCode().substring(8, 12)
						);
						args.put("sizeHeight",
								od.getProductCode().charAt(12) == '0'
										?od.getProductCode().substring(13)
										:od.getProductCode().substring(12)
						);
						cubeSession.insert("insertSizeO", args);
					}
					HashMap<String, String> args = new HashMap<>();
					args.put("productCode", od.getProductCode());
					args.put("originalCode", (!od.getProductCode().startsWith("SO"))
							?od.getProductCode().substring(0,8)
							:od.getProductCode().substring(0,9));
					args.put("sizeCode", od.getProductCode().substring(8));
					args.put("employeeCode", orderB.getEmployeeCode());
					args.put("colorGroup", od.getProductCode().substring(2, 3));
					cubeSession.insert("insertProductO", args);
				};
				if(!od.getOrderPartnerCode().equals("1078152415")) purchasePartner = od.getOrderPartnerCode();
				switch (od.getInsertType()){
					case 0:
						buyList.add(od);
						warehousingList.add(od);
						warehosuingSumWeight += Float.parseFloat(od.getWeight());
						break;
					case 1: buyList.add(od); break;
					case 2:
						buyList.add(od);
						warehousingList.add(od);
						warehosuingSumWeight += Float.parseFloat(od.getWeight());
						warehousing = true;
						releaseList.add(od);
						break;
					case 3:
						releaseList.add(od);
//						if(od.isWarehousing()) warehousing = true;
						if(od.getWarehousing() != null && od.getWarehousing()) warehousing = true;
						break;
					case 4:
						releaseList.add(od); warehousingList.add(od); moveList.add(od);
						warehosuingSumWeight += Float.parseFloat(od.getWeight());
						purchasePartner = "1078152415";
						break;
					case 5:
						lgort = true;
						if (od.getCenterCode().equals("SS11") || od.getCenterCode().equals("SS12")) {
							lgortQty += Float.parseFloat(od.getQty());
							lgortWeight += Float.parseFloat(od.getWeight());
							if(!od.getCenterCode().equals(omg.getWarehousingCenterCode())){
								warehousingList.add(od);
								warehosuingSumWeight += Float.parseFloat(od.getWeight());
								moveList.add(od);
								releaseList.add(od);
								od.setLgort(true);
							}else lgortBean = od;
							purchasePartner = "1078152415";
						}
						break;
				}
			}

			orCode = this.cubeSession.selectOne("insertOrder", orderB);
			orderB.setOrderCode(orCode);
			insertLoop(orderList, 1, orCode, omg);
			if(!buyList.isEmpty()){
				String dpCode = null, salesPartnerCode = null;
				if(omg.getWarehousingCenterCode() != null){
					dpCode = omg.getWarehousingCenterCode().equals("SS11") ?"256" :"463";
					salesPartnerCode = "1078152415";
				}else{
					dpCode = orderB.getDeliveryCode();
					salesPartnerCode = orderB.getOrderPartnerCode();
				}
				buyCode = this.cubeSession.selectOne("insertBuy",BuyB.builder()
						.wantDate(orderB.getWantDate())
						.wantTime(omg.getWantTime())
						.deliveryPartnerCode(dpCode)
						.emCode(orderB.getEmployeeCode())
						.orderCode(orCode)
						.purchasePartnerCode(buyList.get(0).getOrderPartnerCode())
						.salesPartnerCode(salesPartnerCode)
						.stateCode("O11")
						.build());

				insertLoop(buyList, 0, buyCode, omg);
				if(!orderB.getOrderPartnerCode().equals("1078152415") && orderB.getOrStcode2().equals("O42")){
					String saleCode = this.cubeSession.selectOne("insertSale", SaleB.builder()
							.seDpcode(orderB.getDeliveryCode())
							.sePrcode(orderB.getOrderPartnerCode())
							.seEmcode(orderB.getEmployeeCode())
							.seOrcode(orCode)
							.seStclosingCode("CS1")
							.seIstaxinvoice("0")
							.seRlcode(buyCode)
							.build());
					insertLoop(buyList, 4, saleCode, omg);
				}
			}
			if(!releaseList.isEmpty()){
				if(lgort){
					releaseCode = this.cubeSession.selectOne("insertRelease", ReleaseB.builder()
							.wnDate(orderB.getWantDate())
							.deliveryCode(lgortBean.getCenterCode().equals("SS11") ? "9000000001" : "9000000002")
							.orderMoveCode(orCode)
							.employeeCode(orderB.getEmployeeCode())
							.stateCode("R02")
							.centerCode(omg.getReleaseCenterCode().equals("SS11") ?"가000" : "1000")
							.build());

					lgortReleaseCode = this.cubeSession.selectOne("insertRelease",
							ReleaseB.builder()
									.wnDate(orderB.getWantDate())
									.deliveryCode(orderB.getDeliveryCode())
									.orderMoveCode(orCode)
									.employeeCode(orderB.getEmployeeCode())
									.stateCode("R01")
									.centerCode(omg.getReleaseCenterCode())
									.build());
					cubeSession.insert("insertReleaseDetail",
							ReleaseDetail.builder()
									.productCode(lgortBean.getProductCode())
									.sequence(lgortBean.getDetailNumber())
									.releaseCode(lgortReleaseCode)
									.odIscut(lgortBean.getIsCut() != null ?lgortBean.getIsCut() :"0")
									.weight(String.valueOf(lgortWeight))
									.quantity(String.valueOf(lgortQty))
									.rnCode(omg.getReleaseCenterCode().equals("SS11") ?"1000" : "가000")
									.build());
				}else{
					releaseCode = this.cubeSession.selectOne("insertRelease", ReleaseB.builder()
							.wnDate(orderB.getWantDate())
							.deliveryCode(orderB.getDeliveryCode())
							.orderMoveCode(orCode)
							.employeeCode(orderB.getEmployeeCode())
							.stateCode((warehousing) ?"R01" :"R02")
							.centerCode(omg.getReleaseCenterCode())
							.build());
				}
				if(omg.getDeliveryCost() != 0){
					HashMap<String, String> args = new HashMap<>();
					args.put("buyCode", releaseCode);
					args.put("type", "1");
					args.put("cost", String.valueOf(omg.getDeliveryCost()));
					cubeSession.insert("insertDeliveryCost", args);
				}
				insertLoop(releaseList, 3, releaseCode, omg);
			}
			if(!moveList.isEmpty()){
				for(OrderDetail od: moveList){
					String fromPartnerCode = null;
					String destinationPartnerCode = null;
					if(omg.getReleaseCenterCode().equals("SS11")){
						fromPartnerCode = "9000000001";
						destinationPartnerCode = "9000000002";
					}else{
						fromPartnerCode = "9000000002";
						destinationPartnerCode = "9000000001";
					}
					HashMap<String, String> args = new HashMap<>();
					args.put("seq", String.valueOf(od.getDetailNumber()));
					args.put("qty", od.getQty());
					args.put("weight", od.getWeight());
					args.put("fromPartner", fromPartnerCode);
					args.put("destinationPartner", destinationPartnerCode);
					args.put("productCode", od.getProductCode());
					args.put("employeeCode", orderB.getEmployeeCode());
					args.put("isCut", od.getIsCut() != null ?od.getIsCut() :"0");
					args.put("orCode", orCode);
					cubeSession.insert("insertStockMoveO", args);
					if(cubeSession.selectOne("checkCenterProduct", od) == null){
						cubeSession.insert("insertCenterProduct",
								CenterProductB.builder()
										.cpRncode(omg.getWarehousingCenterCode().equals("SS12")? "가000" :"1000")
										.cpRndccode(omg.getWarehousingCenterCode())
										.productCode(od.getProductCode())
										.cpDate((String)cubeSession.selectOne("selectCenterProductMaxDate", omg))
										.cpCount("0")
										.build());
					}
				}
			}
			if(!warehousingList.isEmpty()){
				warehousingCode = this.cubeSession.selectOne("insertWarehousing",
						WarehousingB.builder()
								.weight(warehosuingSumWeight)
								.partnerCode(purchasePartner)
								.buyCode(orCode)
								.employeeCode(orderB.getEmployeeCode())
								.stateCode("W01")
								.centerCode(omg.getWarehousingCenterCode())
								.wnDate(orderB.getWantDate())
								.build());
				insertLoop(warehousingList, 2, warehousingCode, omg);
			}
//			this.rollback();
			this.commit();
			result = true;
		}catch(Exception e) {
			this.rollback();
			e.printStackTrace();
		}finally {
			this.tranEnd();
			oms.setResult(result);
			model.addAttribute("serverData", oms);
		}
	}

	private void insertLoop(ArrayList<OrderDetail> argList, int type, String symbol, OrderMgrReq omg){
		Object targetObject = null;
		String targetStatement = null;
		for(OrderDetail od: argList){
			if(od.getIsCut() == null) od.setIsCut("0");
			switch (type){
				case 0: // 발주
					targetObject = BuyDetail.builder()
							.sequence(od.getDetailNumber())
							.buyCode(symbol)
							.productCode(od.getProductCode())
							.quantity(od.getQty())
							.weight(od.getWeight())
							.packagingCode(od.getPackagingCode())
							.quantityUnitCode((!od.getPackagingCode().equals("OW3") ?"OP2" :"OP3"))
							.colorCode(od.getColorCode())
							.storeYn(od.getStockType() != -1)
							.mappingCode(od.getPaperMakerMapping())
							.build();
					targetStatement = "insertBuyDetail";
					break;
				case 1: // 주문
					od.setOrderCode(symbol);
					targetObject = od;
					targetStatement = "insertOrderDetail";
					break;
				case 2: // 입고
					targetObject = WarehousingDetail.builder()
							.wrCode(symbol)
							.productCode(od.getProductCode())
							.sequence(od.getDetailNumber())
							.quantity(od.getQty())
							.rnCode(omg.getWarehousingCenterCode().equals("SS11") ?"1000" : "가000")
							.build();
					targetStatement = "insertWarehousingDetail";
					if(cubeSession.selectOne("checkCenterProduct", od) == null){
						cubeSession.insert("insertCenterProduct",
								CenterProductB.builder()
										.cpRncode(omg.getWarehousingCenterCode().equals("SS12")? "가000" :"1000")
										.cpRndccode(omg.getWarehousingCenterCode())
										.productCode(od.getProductCode())
										.cpDate((String)cubeSession.selectOne("selectCenterProductMaxDate", omg))
										.cpCount("0")
										.build());
					}
					break;
				case 3: // 출고
					String rnCode = null;
					if(!od.getCenterCode().startsWith("SS")) rnCode = "0000";
					else rnCode = omg.getReleaseCenterCode().equals("SS11") ?"1000" : "가000";
					targetObject = ReleaseDetail.builder()
							.productCode(od.getProductCode())
							.sequence(od.getDetailNumber())
							.releaseCode(symbol)
							.odIscut(od.getIsCut())
							.weight(od.getWeight())
							.quantity(od.getQty())
							.rnCode(rnCode) // 입고 후 출고, 기본값으로 가000 잡아놓음
							.build();
					if(od.getIsCut() == null) ((ReleaseDetail) targetObject).setOdIscut("0");
					else ((ReleaseDetail) targetObject).setOdIscut(od.getIsCut());
					targetStatement = "insertReleaseDetail";
					break;
				case 4: // 매출
					targetObject = SaleDetail.builder()
							.edSecode(symbol)
							.edPtcode(od.getProductCode())
							.edSeq(od.getDetailNumber())
							.edPrcode(omg.getOrder().getOrderPartnerCode())
							.edQty(od.getQty())
							.edWeight(od.getWeight())
							.edIscut(od.getIsCut())
							.edCrcode(od.getColorCode())
							.edPrice(od.getPrice().replace(",", ""))
							.edStclosingCode("O31")
							.build();
					targetStatement = "insertSaleDetail";
			}
			this.cubeSession.insert(targetStatement, targetObject);
			if(type == 1){
				for(Remark remark: od.getRemarkList()){
					if(!remark.getRmText().isEmpty()){
						remark.setRmOdcode(String.valueOf(od.getDetailNumber()));
						remark.setRmOdorcode(od.getOrderCode());
						cubeSession.insert("insertOrderDetailRemark", remark);
					}
				}
			}
		}
	}

}
