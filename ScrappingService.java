package com.sinseungpaper.cube.Services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sinseungpaper.cube.beans.*;
import com.sinseungpaper.cube.common.Encryption;
import com.sinseungpaper.cube.common.ProjectUtils;
import com.sinseungpaper.cube.common.TransactionAssistant;
import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;
import kong.unirest.UnirestException;
import kong.unirest.json.JSONArray;
import kong.unirest.json.JSONObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScrappingService extends TransactionAssistant {
	private final Encryption enc;
	private final ProjectUtils utills;
	private final ObjectMapper mapper;
	private final StockManager stockManager;

	public void apiBackCtl(Model model, String serviceCode){
		Unirest.config().cookieSpec("ignoreCookies");
		switch (serviceCode) {
			case "0": this.stockInit(model); break;
			case "1":
				try{
					this.tranStart(true);
					this.requestStockSearch(model);
					this.purchaseStocksSearch(model);
					this.centerStocksSearch(model);
					this.commit();
				}catch(Exception e){
					this.rollback();
					e.printStackTrace();
				}finally{
					this.tranEnd();
				}
				break;
			case "2": this.deliverPlaceSearch(model); break;
			case "3": this.paperMakerOrder(model); break;
		}
	}

	private void stockInit(Model model) {
		ArrayList<String> msg = new ArrayList<>();
		boolean result = true;
		ArrayList<Object> resultObject = new ArrayList<>();
		try {
			this.tranStart(true);
			String employeeCode = (String) model.getAttribute("employeeCode");
			List<EmployeePaperMakerAuth> auths = this.cubeSession.selectList("selectAuthList",
					employeeCode);
			this.commit();
			stockManager.paperMakerSet(employeeCode);
			for (EmployeePaperMakerAuth auth : auths) {
				switch (auth.getPaperMakerCode()) {
					case "HS": hansolLogin(auth, msg, result); break;
					case "MR": moorimLogin(auth, msg, result); break;
					case "HK": hankookLogin(auth, msg, result); break;
					case "HW": hongwonLogin(auth, msg, result); break;
					case "CN": cnLogin(auth, msg, result); break;
				}
			}
		}catch (Exception e) {
			result = false;
			msg.add("제지사 0");
			e.printStackTrace();
			this.rollback();
		}finally {
			this.tranEnd();
			resultObject.add(result);
			resultObject.add(msg);
			model.addAttribute("result", resultObject);
		}
	}
	
	private void moorimLogin(EmployeePaperMakerAuth auth, ArrayList<String> msg, boolean result){
		try{
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String domainUrl = "https://neozone.moorim.co.kr";
			HttpResponse<String> response1 = Unirest.get(domainUrl + "/login.do").asString();
			List<String> cookies = response1.getHeaders().get("Set-Cookie"); /* 쿠키 수집 */
			Document doc = Jsoup.parse(response1.getBody());
			Element inputElement = doc.getElementById("CSRFToken"); /* html에서 CSRFToken값 파싱하여 수집 */
			if (cookies != null && inputElement != null) {
				String reqCookie = "";
				if (cookies != null) {
					for (String cookie : cookies) {
						reqCookie += cookie.split(";")[0] + ";";
					}
				}
				String value = inputElement.attr("value");
				if (!reqCookie.trim().isEmpty() && !value.trim().isEmpty()) {
					HashMap<String, String> moorimCookies = new HashMap<>();
					HttpResponse<String> response2 = Unirest.post(domainUrl + "/retrieveUserInfo.do")
							.header("Content-Type", "application/x-www-form-urlencoded").header("Cookie", reqCookie)
							.field("CSRFToken", value).field("id", decStr(auth.getPaperMakerId()))
							.field("pw", decStr(auth.getPaperMakerPw())).field("lang", "KO")
							.asString();
					if (response2.getStatus() == 302) {
						String location = response2.getHeaders().getFirst("Location");
						Unirest.get(domainUrl + "/" + location).asString();
						moorimCookies.put("cookie", reqCookie);
						moorimCookies.put("CSRFToken", value);
						stockManager.paperMakerPut(employeeCode, "moorim", moorimCookies);
						msg.add("무림 1");
					}else{
						msg.add("무림 0");
						throw new UnirestException("무림 로그인 실패");
					}
				}
			}else{
				msg.add("무림 -1");
				throw new UnirestException("무림 접속 실패");
			}
		}catch(Exception e){
			e.printStackTrace();
			result = false;
		}
	}

	private void hansolLogin(EmployeePaperMakerAuth auth, ArrayList<String> msg, boolean result){
		try{
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String domainUrl = "https://hansol.papermarketplace.co.kr";
			HttpResponse<String> response = Unirest.get(domainUrl + "/login.aspx").asString();
			if(response.isSuccess()) {
				List<String> cookies = response.getHeaders().get("Set-Cookie"); /* 쿠키 수집 */
				String reqCookie = "";
				if (cookies != null) {
					for (String cookie : cookies) {
						reqCookie += cookie.split(";")[0];
					}
					HashMap<String, String> hansolFieldValue = new HashMap<>();
					HashMap<String, String> body = new HashMap<>();
					body.put("loginID", decStr(auth.getPaperMakerId()));
					body.put("loginPWD", decStr(auth.getPaperMakerPw()));
					HttpResponse<JsonNode> response1 = Unirest.post(domainUrl + "/login.aspx/CheckLogin")
							.header("Content-Type", "application/json; charset=UTF-8")
							.header("cookie", reqCookie)
							.body(body)
							.asJson();
					HashMap<String, Object> responseMap = mapper.readValue(response1.getBody().toString(), new TypeReference<>() {});
					if(((HashMap<String, Object>)responseMap.get("d")).get("Result").equals("ok")) {
						hansolFieldValue.put("cookie", reqCookie);
						stockManager.paperMakerPut(employeeCode, "hansol", hansolFieldValue);
						msg.add("한솔 1");
					}else{
						msg.add("한솔 0");
						throw new UnirestException("한솔 로그인 실패");
					}
				}
			}else{
				msg.add("한솔 -1");
				throw new UnirestException("한솔 접속 실패");
			}
		}catch(Exception e){
			e.printStackTrace();
			result = false;
		}
	}

	private void hankookLogin(EmployeePaperMakerAuth auth, ArrayList<String> msg, boolean result){
		try{
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String domainUrl = "http://www.x-pri.co.kr:8008/uBoard";
			HashMap<String, String> hankookCookies = new HashMap<>();
			HttpResponse<String> response1 = Unirest.get(domainUrl + "/login/login.ub").asString();
			List<String> cookies = response1.getHeaders().get("Set-Cookie"); /* 쿠키 수집 */
				String reqCookie = "";
				if (cookies != null) {
					for (String cookie : cookies) {
						reqCookie += cookie.split(";")[0] + ";";
					}
				}

			HttpResponse<String> response2 = Unirest.post(domainUrl+ "/root/session.ub")
					.header("cookie", reqCookie)
					.header("Content-Type", "application/x-www-form-urlencoded")
					.field("userId", decStr(auth.getPaperMakerId()))
					.field("empPwd", decStr(auth.getPaperMakerPw()))
					.field("newEmpPwd", "")
					.field("myInfoUpdateYn", "")
					.asString();
			if (response2.getStatus() == 302){
				msg.add("한국 1");
				hankookCookies.put("cookie", reqCookie);
				stockManager.paperMakerPut(employeeCode, "hankook", hankookCookies);
			}
			else{
				msg.add("한국 0");
				throw new UnirestException("한국 로그인 실패");
			}
		}catch(Exception e){
			e.printStackTrace();
			result = false;
		}
	}

	private void hongwonLogin(EmployeePaperMakerAuth auth, ArrayList<String> msg, boolean result){
		try{
			String domainUrl = "http://b2b.hongwon.com";
			HashMap<String, String> hongwonCookies = new HashMap<>();
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			HttpResponse<String> response1 = Unirest.get(domainUrl).asString();
			if(response1.getStatus() == 200) {
				List<String> cookies = response1.getHeaders().get("Set-Cookie"); /* 쿠키 수집 */
				String reqCookie = "";
				if (cookies != null) {
					for (String cookie : cookies) {
						reqCookie += cookie.split(";")[0] + ";";
					}
				}
				HttpResponse<JsonNode> response2 = Unirest.post(domainUrl + "/login/login.do")
						.header("cookie", reqCookie)
						.header("Content-Type", "application/x-www-form-urlencoded")
						.field("userCd", decStr(auth.getPaperMakerId()))
						.field("password", decStr(auth.getPaperMakerPw()))
						.asJson();
				HashMap<String, String> responseMap = mapper.readValue(response2.getBody().toString(), new TypeReference<>() {});
				if(responseMap.get("success").equals("true")){
					hongwonCookies.put("cookie", reqCookie);
					stockManager.paperMakerPut(employeeCode, "hongwon", hongwonCookies);
					msg.add("홍원 1");
				}
				else{
					msg.add("홍원 0");
					throw new UnirestException("홍원 로그인 실패");
				}
			}else{
				msg.add("홍원 -1");
				throw new UnirestException("홍원 접속 실패");
			}
		}catch(Exception e){
			e.printStackTrace();
			result = false;
		}
	}

	private void cnLogin(EmployeePaperMakerAuth auth, ArrayList<String> msg, boolean result){
		try{
		String domainUrl = "http://ioms.dhpulp.co.kr";
			HashMap<String, String> cnCookies = new HashMap<>();
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			HttpResponse<String> response1 = Unirest.get(domainUrl + "/common/login/iomsLoginPage.dev").asString();
			if(response1.getStatus() == 200) {
				List<String> cookies = response1.getHeaders().get("Set-Cookie"); /* 쿠키 수집 */
				String reqCookie = "";
				if (cookies != null) {
					for (String cookie : cookies) {
						reqCookie += cookie.split(";")[0] + ";";
					}
				}
				HttpResponse<String> response2 = Unirest.post(domainUrl + "/common/login/iomsLogin.dev")
						.header("cookie", reqCookie)
						.header("Content-Type", "application/x-www-form-urlencoded")
						.field("loginid", decStr(auth.getPaperMakerId()))
						.field("loginpw", decStr(auth.getPaperMakerPw()))
						.asString();
				if(response2.getHeaders().get("Content-Length").isEmpty()) {
					cnCookies.put("cookie", reqCookie);
					stockManager.paperMakerPut(employeeCode, "cn", cnCookies);
					msg.add("깨나라 1");
				}else{
					msg.add("깨나라 0");
					throw new UnirestException("깨나라 로그인 실패");
				}
			}else{
				msg.add("깨나라 -1");
				throw new UnirestException("깨나라 접속 실패");
			}
		}catch(Exception e){
			e.printStackTrace();
			result = false;
		}
	}

	private void centerStocksSearch(Model model) {
		HashMap<String, String> args = new HashMap<>();
		Originals og = (Originals) model.getAttribute("og");
		String width = ((String) model.getAttribute("width"));
		String height = ((String) model.getAttribute("height"));

		if(!width.isEmpty()) args.put("width", (width.length() == 3) ?"0" + width :width);
		if(!height.isEmpty()) args.put("height", (height.length() == 3) ?"0" + height :height);
		args.put("originalCode", og.getOgCode());
		args.put("originalWeight",
				(og.getOgWeight().length() == 2) ?"0" + og.getOgWeight() :og.getOgWeight());
		args.put("paperCode", ((String) model.getAttribute("paperCode")));
		args.put("prCode", ((String) model.getAttribute("prCode")));
		args.put("date", ((String) model.getAttribute("date")));
		List<CenterProductB> centerStocks = null;
		try {
			/* 을지 - 파주 총재고 */
			centerStocks = cubeSession.selectList("selectEuljiPajuListTarget", args);
			/* 을지 - 파주 입고 완료 재고 (더하기) */
			List<CenterProductB> planYList = cubeSession.selectList("selectEuljiPajuPlanYListTarget", args);
			/* 을지 - 파주 입고 예정 재고 (더하기) */
			List<CenterProductB> planNList = cubeSession.selectList("selectEuljiPajuPlanNListTarget", args);
			/* 을지 - 파주 출고 완료 재고 (빼기) */
			List<CenterProductB> releaseYList = cubeSession.selectList("selectEuljiPajuReleaseYListTarget", args);
			/* 을지 - 파주 출고 예정 재고 (빼기) */
			List<CenterProductB> releaseNList = cubeSession.selectList("selectEuljiPajuReleaseNListTarget", args);
			/* 을지 - 파주 매출 보관 재고 */
			List<SaleStorageB> saveList= cubeSession.selectList("selectEuljiPajuSaveListTarget", args);

			for(CenterProductB stock: centerStocks){
				stock.setReleaseQty("0"); stock.setRentalQty("0"); stock.setScheduleQty("0");
				for(CenterProductB calcBean: planYList){ // 입고 완료 더하기
					if(stock.getCpRndccode().equals(calcBean.getCpRndccode())
					&& stock.getProductCode().equals(calcBean.getProductCode()))
						stock.setCpCount(String.valueOf(Float.parseFloat(stock.getCpCount()) + Float.parseFloat(calcBean.getCpCount())));
				}
				for(CenterProductB calcBean: releaseYList){ // 출고 완료 빼기
					if(stock.getCpRndccode().equals(calcBean.getCpRndccode())
					&& stock.getProductCode().equals(calcBean.getProductCode()))
						stock.setCpCount(String.valueOf(Float.parseFloat(stock.getCpCount()) - Float.parseFloat(calcBean.getCpCount())));
				}
				for(CenterProductB calcBean: planNList){ // 입고 예정 더하기 별도 표기
					if(stock.getCpRndccode().equals(calcBean.getCpRndccode())
					&& stock.getProductCode().equals(calcBean.getProductCode())){
						stock.setCpCount(String.valueOf(Float.parseFloat(stock.getCpCount()) + Float.parseFloat(calcBean.getCpCount())));
						stock.setScheduleQty(String.valueOf(Float.parseFloat(stock.getScheduleQty()) + Float.parseFloat(calcBean.getCpCount())));
					}
				}
				for(CenterProductB calcBean: releaseNList){ // 출고 예정 빼기 별도 표기
					if(stock.getCpRndccode().equals(calcBean.getCpRndccode())
					&& stock.getProductCode().equals(calcBean.getProductCode())){
						stock.setCpCount(String.valueOf(Float.parseFloat(stock.getCpCount()) - Float.parseFloat(calcBean.getCpCount())));
						stock.setReleaseQty(String.valueOf(Float.parseFloat(stock.getReleaseQty()) + Float.parseFloat(calcBean.getCpCount())));
					}
				}
				for(SaleStorageB calcBean: saveList){ // 매출 보관 별도 표기
					if(stock.getCpRndccode().equals(calcBean.getSaDccode())
					&& stock.getProductCode().equals(calcBean.getProductCode())){
//						stock.setCpCount(String.valueOf(Float.parseFloat(stock.getCpCount()) + Float.parseFloat(calcBean.getSaQty())));
						stock.setRentalQty(String.valueOf(Float.parseFloat(stock.getRentalQty()) + Float.parseFloat(calcBean.getSaQty())));
					}
				}
				stock.setCpCount(String.valueOf(Float.parseFloat(stock.getCpCount()) / 500));
				stock.setReleaseQty(String.valueOf(Float.parseFloat(stock.getReleaseQty()) / 500));
				stock.setRentalQty(String.valueOf(Float.parseFloat(stock.getRentalQty()) / 500));
				stock.setScheduleQty(String.valueOf(Float.parseFloat(stock.getScheduleQty()) / 500));
			}
		}catch(Exception e) {e.printStackTrace();}
		((ArrayList<Object>) model.getAttribute("result")).add(centerStocks);
	}

	private void 	purchaseStocksSearch(Model model) {
		List<PurchaseStockBean> purchaseStocks = new ArrayList<>();
		if(model.getAttribute("prCode") != null){
			HashMap<String, String> args = new HashMap<>();
			Originals og = (Originals) model.getAttribute("og");
			args.put("prCode", (String) model.getAttribute("prCode"));
			args.put("originalCode", og.getOgCode());
			args.put("originalPaperMakerCode", og.getOgPmcode());
			try {purchaseStocks = cubeSession.selectList("selectPurchaseStock", args);
			}catch (Exception e) { e.printStackTrace();}
		}
		((ArrayList<Object>) model.getAttribute("result")).add(purchaseStocks);
	}

	private void requestStockSearch(Model model) {
		Originals og = (Originals) model.getAttribute("og");
		String discountRate = null;
			HashMap<String, String> args = new HashMap<>();
			args.put("prCode", (String)model.getAttribute("prCode"));
			args.put("paperCode", (String)model.getAttribute("paperCode"));
		try{
			discountRate = cubeSession.selectOne("selectDiscountRate", args);
		}catch (Exception e){e.printStackTrace();}
		switch (og.getOgPmcode()) {
			// 한솔
			case "HS": case "HA": case"HP": hansolSearching(model, og); break;
			// 무림
			case "MP": case "MR": case "MS": moorimSearching(model, og); break;
			// 한국
			case "HK": hankookSearching(model, og); break;
			// 홍원
			case "HW": hongwonSearching(model, og); break;
			// 깨나라
			case "CN": cnSearching(model, og); break;
			default: ((ArrayList<Object>) model.getAttribute("result")).add(new StockListBean());

		}
		StockListBean result = (StockListBean) ((ArrayList<Object>) model.getAttribute("result")).get(0);
		result.setDiscountRate(discountRate);
	}
	
	private void moorimSearching(Model model, Originals og){
		StockListBean stockListBean = new StockListBean();
		String domainUrl = "https://neozone.moorim.co.kr";
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "moorim").get("cookie");
			String CSRFToken = stockManager.paperMakerGet(employeeCode, "moorim").get("CSRFToken");
			String width = (String) model.getAttribute("width");
			String height = (String) model.getAttribute("height");
			
			/* 발주재고출하의 주문서작성 재고조회 검색 */
			HttpResponse<String> response4 = Unirest.post(domainUrl + "/order/cuSalesOrderForm.do")
					.header("authority", "neozone.moorim.co.kr")
					.header("content-type", "application/x-www-form-urlencoded").header("cookie", cookies)
					.field("CSRFToken", CSRFToken).field("clickMenuId1", "5150").field("clickMenuId2", "5200")
					.field("clickMenuName", "주문서작성").field("openTopYn", "Y").field("openLeftYn", "Y")
					.field("cacheFlag", "Y").field("hidIKunnrNm", "(주)신승아이엔씨").field("I_KUNNR", "100028") // 회사 코드
					//.field("hidIGradeNm", "네오★백상") // 상품명
					.field("I_GRADE", og.getOgPmMapping()) /* 지종 코드 */
					.field("I_BASIS", og.getOgWeight()) /* 평량 */
					.field("hidSize", "10").field("I_WIDTH", width) /* 가로 */
					.field("I_LENGT", height) /* 세로 */
					.field("I_EXCEED", "X")
					.field("firstSearch", "N")
					.asString();
			Element body = Jsoup.parse(response4.getBody());
			Elements trs = body.select("#tableBody > tbody > tr");
			String[] centers = { "시흥", "청라", "교하", "진주", "울산", "대구", "을지로" };
			if(!trs.get(0).text().equals("조회된 데이터가 없습니다.")) {
				for (Element tr : trs) {
					if (!tr.select("td.center.bg_yellow").text().equals("0 0 0 0") &&
							!tr.select("td.center.bg_yellow").text().equals("0 0")) { // 합계가 0이 아니면
						Elements tds = tr.select("td");
						String buy = tds.get(0).text();
						String[] productInfo = tds.get(1).text().split(" ");
						String packaging = tds.get(2).text();
						List<Element> stocks = tds.subList(8, 14);
						/* 상품의 재고를 담아두는 List
						  idx 0 >> 재고 상태 ex) 정상, 임대
						   idx 1~ >> 센터명 재고
						 */
						ArrayList<String> stockList = new ArrayList<>();
						ArrayList<HashMap<String, String>> filedValueList = new ArrayList<>();
						stockList.add(tds.get(6).text());
						for (Element stock : stocks) {
							if (stock.hasText()) {
								Elements aList = stock.select("a");
								for (Element a : aList) {
									if (a.hasText() && !a.text().equals("0") && !a.attr("data-target").equals("igo")) {
										HashMap<String, String> filedValue = new HashMap<>();
										/* 주문등록 필드값 */
										filedValue.put("callflage", a.attr("data-callflag"));
										filedValue.put("werks", a.attr("data-werks"));
										filedValue.put("lgort", a.attr("data-lgort"));
										filedValue.put("matnr", a.attr("data-matnr"));
										filedValue.put("zpkid", a.attr("data-zpkid"));
										filedValue.put("scmng", a.attr("data-scmng")); // 속당 연수
										filedValue.put("parem", a.attr("data-parem"));
										filedValue.put("CSRFToken", CSRFToken);
										filedValue.put("grade", og.getOgPmMapping());
										filedValueList.add(filedValue);
										/* 센터, 재고수 */
										stockList.add(centers[stocks.indexOf(stock)] + " " + a.text());
									}
								}
							}
						}
						
						float scmng = Float.parseFloat(filedValueList.get(filedValueList.size()-1).get("scmng").trim());
						float parem = Float.parseFloat(filedValueList.get(filedValueList.size()-1).get("parem").trim());

						StockBean bean = StockBean.builder()
								.paperMakerName(buy)
								.originalName(productInfo[0])
								.grammage(productInfo[1])
								.size(productInfo[2])
								.packaging(packaging)
								.qtyUnit(String.format("%.2f", scmng))
								.palletUnit(String.format("%.1f", parem))
								.stockList(stockList)
								.filedValue(filedValueList)
								.build();
						stockListBean.getStockList().add(bean);
					}
				}
			}else throw new UnirestException("무림 재고 검색 결과 없음");
		}catch(Exception e) {e.printStackTrace();
		}finally {
			((ArrayList<Object>) model.getAttribute("result")).add(stockListBean);
		}
	}

	private void hansolSearching(Model model, Originals og) {
		StockListBean beanList = new StockListBean();
		String domainUrl = "https://hansol.papermarketplace.co.kr/";
//		String domainUrl = "https://hansoldev.e-sang.net/";
		try {
			String width = (String) model.getAttribute("width") != null ? (String) model.getAttribute("width") : "";
			String height = (String) model.getAttribute("height") != null ? (String) model.getAttribute("height") : "";
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "hansol").get("cookie");
			HttpResponse<String> response1 = Unirest.get(domainUrl + "ship/orderreq.aspx")
					.header("cookie", cookies).asString();
			Document doc = Jsoup.parse(response1.getBody());
			Map<String, Object> requestFieldMap = new HashMap<>();
			for(Element input : doc.select("#aspnetForm").select("input")) {
				if(input.hasAttr("name")) requestFieldMap.put(input.attr("name"), input.val());
			}
			requestFieldMap.put("ctl00$ctl00$ContentBody$sm", "ctl00$ctl00$ContentBody$sm|ctl00$ctl00$ContentBody$Content$ucPopStock1$lnkSearch");
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucPopStock1$selStockType", "A");
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucPopStock1$ucSearchPaper1$hdPaperCode", og.getOgPmMapping());
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucPopStock1$ucSearchBarisWeight1$txtWeightFrom", og.getOgWeight());
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucPopStock1$ucSearchSizeGaro$txtSizeFrom", width);
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucPopStock1$ucSearchSizeSero$txtSizeFrom", height);
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucPopStock1$ddlPaging", "10000");
			requestFieldMap.put("__EVENTTARGET", "ctl00$ctl00$ContentBody$Content$ucPopStock1$lnkSearch");
			requestFieldMap.put("__VIEWSTATE", doc.selectFirst("#__VIEWSTATE").val());
			requestFieldMap.put("__VIEWSTATEGENERATOR", doc.selectFirst("#__VIEWSTATEGENERATOR").val());
			requestFieldMap.put("__EVENTVALIDATION", doc.selectFirst("#__EVENTVALIDATION").val());
			requestFieldMap.put("__ASYNCPOST", "true");
			HttpResponse<String> response2 = Unirest.post(domainUrl + "ship/orderreq.aspx")
					.header("cookie", cookies)
					.header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Whale/3.22.205.26 Safari/537.36")
					.contentType("application/x-www-form-urlencoded; charset=UTF-8")
					.fields(requestFieldMap)
					.asString();
			Document doc2 = Jsoup.parse(response2.getBody());
			Elements trs = doc2.select("#ctl00_ctl00_ContentBody_Content_ucPopStock1_gvListStock > tbody > tr");
			ArrayList<String> centers = new ArrayList<>();
			try{
				for(Element th: trs.get(1).select("th")) {
					centers.add(th.text().trim());
				}
			}catch(IndexOutOfBoundsException e){
				throw new UnirestException("한솔 재고 검색 결과 없음");
			}
			String[] keys =
						{
								"MAKTX", "ZXTXT", "MATNR", "CHARG", "STDWEIGHT", "LGORT",
								"LGORTNM", "GEWEI", "VRKME", "POSNR", "StockType", "VBELN", "WERKS",
								"SPART", "WKIND", "ITEM2", "ITEM2NM", "SPEC1", "SPEC2", "SPEC3",
								"STOCKQTY", "STOCKWGT", "MAKER", "StockType_Name", "FIELD3", "ITEM3"
						};
				Elements ths = trs.get(0).select("th");
				HashMap<String, Integer> headerIndexMap = new HashMap<String, Integer>();
				for(int i=0; i<ths.size(); i++){
					if(!ths.get(i).text().isEmpty()) headerIndexMap.put(ths.get(i).text(), i);
				}
				Elements stockThs = trs.get(2).select("th");
				ArrayList<Integer> stocksIndexList = new ArrayList<>();
				int sizeCheck = 1;
				if(stockThs.get(1).text().equals("중량")) sizeCheck = 2;
				for(int i = 0; i<stockThs.size() - sizeCheck; i++){
					if(stockThs.get(i).text().equals("수량")) stocksIndexList.add(i);
				}
				String paperMakerName = null;
				StockBean bean = null;
				Elements beforeTds = null;
				for(Element tr: trs.subList(3, trs.size())) {
					ArrayList<HashMap<String, String>> fieldValues = new ArrayList<>();
					ArrayList<String> stockList = new ArrayList<>();
					Elements tds = tr.select("td");
					if(tds.get(0).text().isEmpty()) {
						beforeTds = tds;
						List<Element> stockTds = tds.subList(headerIndexMap.get("구분") + 1, tds.size()-1);
						stockList.add(tds.get(headerIndexMap.get("구분")).text().trim());
						for(Integer stocksIdx: stocksIndexList){
							if(!stockTds.get(stocksIdx).text().trim().isEmpty()) {
								HashMap<String, String> fieldValue = new HashMap<>();
								stockList.add(centers.get(stocksIndexList.indexOf(stocksIdx)) + " " + stockTds.get(stocksIdx).text());
								String[] values = stockTds.get(stocksIdx).selectFirst("a").attr("href").split("\\('")[1]
										.split("'\\)")[0]
										.split("','");
								for(int i=0; i<values.length; i++) {
									fieldValue.put(keys[i], values[i]);
								}
								fieldValues.add(fieldValue);
							}
						}
						switch(tds.get(headerIndexMap.get("생산처")).text().trim()){
							case "장항": case "대전": paperMakerName = "한솔"; break;
							case "신탄진": paperMakerName = "아트원"; break;
							case "천안": paperMakerName = "파텍"; break;
						}
						String qtyUnit = null;
						switch(tds.get(headerIndexMap.get("최소속수")).text()){
							case "0.00": case "-": qtyUnit = "0.01"; break;
							default : qtyUnit = tds.get(headerIndexMap.get("최소속수")).text();
						}
						bean = StockBean.builder()
								.paperMakerName(paperMakerName)
								.originalName(tds.get(headerIndexMap.get("지종")).text().trim())
								.grammage(tds.get(headerIndexMap.get("평량")).text().trim())
								.size(tds.get(headerIndexMap.get("가로")).text().trim() + "*" + tds.get(headerIndexMap.get("세로")).text().trim())
								.packaging(tds.get(headerIndexMap.get("포장")).text().trim())
								.qtyUnit(qtyUnit)
								.stockList(stockList)
								.palletUnit("0")
								.filedValue(fieldValues)
								.build();
//					log.info(bean.toString());
					}else {
						if(!tds.get(0).text().equals("타사주문")){
							stockList.add(tds.get(1).text().trim());
							List<Element> stockTds = tds.subList(2, tds.size()-1);
							for(Integer stocksIdx: stocksIndexList){
//							log.info(stockTds.get(stocksIdx).text());
								if(!stockTds.get(stocksIdx).text().trim().isEmpty()) {
									HashMap<String, String> fieldValue = new HashMap<>();
									stockList.add(centers.get(stocksIndexList.indexOf(stocksIdx)) + " " + stockTds.get(stocksIdx).text());
									String[] values = stockTds.get(stocksIdx).selectFirst("a").attr("href").split("\\('")[1]
											.split("'\\)")[0]
											.split("','");
									for(int i=0; i<values.length; i++) {
										fieldValue.put(keys[i], values[i]);
									}
									fieldValues.add(fieldValue);
								}
							}
							String qtyUnit = null;
							switch(beforeTds.get(headerIndexMap.get("최소속수")).text()){
								case "0.00": case "-": qtyUnit = "0.01"; break;
								default : qtyUnit = beforeTds.get(headerIndexMap.get("최소속수")).text();
							}
							bean = StockBean.builder()
									.paperMakerName(paperMakerName)
									.originalName(beforeTds.get(headerIndexMap.get("지종")).text().trim())
									.grammage(beforeTds.get(headerIndexMap.get("평량")).text().trim())
									.size(beforeTds.get(headerIndexMap.get("가로")).text().trim() + "*" + beforeTds.get(headerIndexMap.get("세로")).text().trim())
									.qtyUnit(qtyUnit)
									.palletUnit("0")
									.stockList(stockList)
									.filedValue(fieldValues)
									.build();
						}
					}
					beanList.getStockList().add(bean);
				}
		}catch(Exception e){e.printStackTrace();
		}finally {
			((ArrayList<Object>) model.getAttribute("result")).add(beanList);
		}
	}

	private void hankookSearching(Model model, Originals og){
		String domainUrl = "http://www.x-pri.co.kr:8008/uBoard";
		String width = (String) model.getAttribute("width") != null ? (String) model.getAttribute("width") : "";
		String height = (String) model.getAttribute("height") != null ? (String) model.getAttribute("height") :"";
		StockListBean stockListBean = new StockListBean();

		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "hankook").get("cookie");

			HttpResponse<JsonNode> response4 = Unirest.get(domainUrl + "/web/stock/stockSearch.ub?customerNum=203268")
					.queryString("customerId", "5006")
					.queryString("jiJongGun", og.getOgPmMapping().split("\\|")[0])
					.queryString("jiJong", og.getOgPmMapping().split("\\|")[1])
					.queryString("pwgt", og.getOgWeight())
					.queryString("xSize", width)
					.queryString("ySize", height)
					.queryString("packingTy", "")
					.queryString("brandTy", "")
					.queryString("orderHistory", "0")
					.queryString("onlyStore", "0")
					.queryString("sizeJb", "")
					.header("cookie", cookies)
					.asJson();
			ArrayList<HashMap<String, String>> products = mapper.readValue(response4.getBody().toString(), new TypeReference<>() {});
			if(!products.isEmpty()){
				ArrayList<StockBean> stockBeanList = new ArrayList<StockBean>();
				stockListBean.setStockList(stockBeanList);
				for(HashMap<String, String> product : products) {
					ArrayList<String> stockList = new ArrayList<>();
					StringBuffer state = new StringBuffer();
					if(product.containsKey("boganCust")) {
						if(product.containsKey("jungsangSum")) {
							state.append("보관 ");
							state.append(product.get("boganCust"));
							state.append("|");
							state.append("정상 ");
							state.append(product.get("jungsangSum"));
						}
						else {
							state.append("보관 ");
							state.append(product.get("boganCust"));
						}
					}else {
						state.append("정상 ");
						state.append(product.get("jungsangSum"));
					}
					ArrayList<HashMap<String, String>> filedValueList = new ArrayList<>();
					stockList.add(state.toString());
					if(product.containsKey("pjWgt")) {
						stockList.add("파주 " + product.get("pjWgt"));
						filedValueList.add(product); // 파주
					}
					if(product.containsKey("obWgt")) {
						stockList.add("오봉 " + product.get("obWgt"));
						filedValueList.add(product); // 오봉
					}
					if(product.containsKey("osWgt")) {
						stockList.add("온산 " + product.get("osWgt"));
						filedValueList.add(product); // 온산
					}
					
					String qtyUnit = filedValueList.get(filedValueList.size()-1).get("sokCnt").trim().equals(".5") ? "0.5"
							: filedValueList.get(filedValueList.size()-1).get("sokCnt").trim();
					
					StockBean bean = StockBean.builder()
							.paperMakerName("한국")
							.originalName(product.get("paperSname"))
							.grammage(product.get("gramSqMeter"))
							.size(product.get("sizeX") + "*" + product.get("sizeY"))
							.packaging(product.get("packingType"))
							.qtyUnit(qtyUnit)
							.palletUnit(filedValueList.get(filedValueList.size()-1).get("ream").trim())
							.stockList(stockList)
							.filedValue(filedValueList)
							.build();
					stockBeanList.add(bean);
				}
			}else throw new UnirestException("한국 재고 검색 결과 없음");
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			((ArrayList<Object>) model.getAttribute("result")).add(stockListBean);
		}
	}

	private void hongwonSearching(Model model, Originals og){
		StockListBean beanList = new StockListBean();
		try {
			String domainUrl = "http://b2b.hongwon.com";
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "hongwon").get("cookie");
			String width = (String) model.getAttribute("width");
			if(width.length() == 3) width = "0" + width;
			if(og.getOgWeight().length() == 2) og.setOgWeight("0" + og.getOgWeight());
			String field = og.getOgPmMapping() + og.getOgWeight() + width;
			HttpResponse<JsonNode> response = Unirest.post(domainUrl + "/stock/selectListStockJson.do")
					.header("cookie", cookies)
					.header("Content-Type", "application/x-www-form-urlencoded")
					.field("itemCd", field)
					.asJson();
			HashMap<String, Object> responseMap = mapper.readValue(response.getBody().toString(), new TypeReference<>() {});
			if(responseMap.get("msgCode").equals("0")) {
				ArrayList<HashMap<String, Object>> products = (ArrayList<HashMap<String, Object>>) responseMap.get("rows");
				if(!products.isEmpty()) {
					for(HashMap<String, Object> product : products) {
						ArrayList<String> stocks = new ArrayList<>();
						if(!product.get("STOCK_QTY").equals("0.0")) {
							stocks.add("정상 " + Double.toString((double) product.get("STOCK_QTY")));
							stocks.add("물류 " + Double.toString((double) product.get("STOCK_QTY") + (double) product.get("VMI_QTY")));
						}
						if((double) product.get("VMI_QTY") != 0.0) {
							stocks.add("보관 "+ product.get("VMI_QTY"));
						}
						ArrayList<HashMap<String, String>> fieldValues = new ArrayList<HashMap<String, String>>();
						HashMap<String, String> fieldValue = new HashMap<>();
						fieldValue.put("itemCd", (String) product.get("ITEM_CD"));
						fieldValue.put("itemName", og.getOgName());
						fieldValues.add(fieldValue);
						StockBean bean = StockBean.builder()
								.paperMakerName("홍원")
								.originalName((String)product.get("JIJONG_NAME"))
								.grammage(og.getOgWeight())
								.size(product.get("W_NM") + "*" + product.get("H_NM"))
								.packaging(product.get("H_NM").equals("ROLL") ?"Roll" :"Ream")
								.qtyUnit("0.001")
								.palletUnit("0")
								.stockList(stocks)
								.filedValue(fieldValues)
								.build();
						beanList.getStockList().add(bean);
					}
				}else throw new UnirestException("홍원 재고 검색 결과 없음");
			}else throw new UnirestException("홍원 재고 조회 실패");
		}catch (Exception e) {e.printStackTrace();
		}finally {
			((ArrayList<Object>) model.getAttribute("result")).add(beanList);
		}
	}

	private void cnSearching(Model model, Originals og) {
		StockListBean beanList = new StockListBean();
		try {
			String domainUrl = "http://ioms.dhpulp.co.kr/";
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "cn").get("cookie");
			String width = (String) model.getAttribute("width");
			String height = (String) model.getAttribute("height");
			String requestCookies = new StringBuffer()
					.append(cookies)
					.append("tagIdx=0;")
					.append("tagIdx2=0;")
					.append("leftAct=1")
					.toString();
			HttpResponse<String> response2 = Unirest.post(domainUrl + "ioms/paper/order/order/stockCondAll_now.dev")
					.header("cookie", requestCookies)
					.contentType("application/x-www-form-urlencoded")
					.field("devonTargetRow", "")
					.field("devonOrderBy", "")
					.field("sGbn", "jijong")
					.field("sText", "")
					.field("jijong1deph", og.getOgPmMapping())
					.field("jijong2deph", "")
					.field("stockGubn", "")
					.field("prodWeightFr", og.getOgWeight())
					.field("prodWeightTo", og.getOgWeight())
					.field("prodWidth", width)
					.field("prodHeight", height)
					.field("vbCombo", "")
					.field("prodScope", (String)model.getAttribute("range"))
					.field("custCd", "0000101027")
					.field("prodPacking", "")
					.field("rowCnt", "50")
					.asString();
			if(response2.isSuccess()) {
				Document doc = Jsoup.parse(response2.getBody());
				Elements trs = doc.select("#conts_box > div.grid_area > form > table > tbody > tr");
				if(trs.size() > 1) {
					for(Element tr: trs) {
						Elements hiddenInputs = tr.select("input[type=hidden]");
						ArrayList<String> stockList = new ArrayList<>();
						ArrayList<HashMap<String, String>> fieldValues = new ArrayList<>();
						HashMap<String, String> fieldValue = new HashMap<>();
						fieldValues.add(fieldValue);
						for(Element hiddenInput: hiddenInputs) {
							fieldValue.put(hiddenInput.attr("name"), hiddenInput.val());
						}
						stockList.add(hiddenInputs.get(1).val().substring(0, 2));
						stockList.add(tr.selectFirst("td.ta_c p").text() + " " + hiddenInputs.get(9).val());
						stockList.add("총 "+ hiddenInputs.get(21).val());
						String [] textArray = tr.selectFirst("td.ta_l").text().split(" ");
						String size = null;
						String packaging = null;
						for(int i=0; i<textArray.length; i++){
							if(textArray[i].contains("*")){
								if(textArray[i].split("\\*").length == 0){
									size = textArray[i-1] + "*" + textArray[i+1];
									packaging = textArray[i+2];
								}else{
									size = textArray[i];
									packaging = textArray[i+1];
								}
							}
						}
						StockBean bean = StockBean.builder()
								.paperMakerName("깨나라")
								.originalName(textArray[1])
								.grammage(og.getOgWeight())
								.packaging(packaging)
								.size(size)
								.qtyUnit("0.01")
								.palletUnit("1")
								.stockList(stockList)
								.filedValue(fieldValues)
								.build();
						beanList.getStockList().add(bean);
					}
				}else throw new UnirestException("깨나라 검색 결과 없음");
			}else throw new UnirestException("깨나라 검색 실패");
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			((ArrayList<Object>) model.getAttribute("result")).add(beanList);
		}
	}

	private void deliverPlaceSearch(Model model) {
		switch ((String) model.getAttribute("pmCode")) {
			// 무림
			case "MR": case "MP": case "MS": moorimPlaceSearch(model); break;
			// 한솔
			case "HS": case "HA": hansolPlaceSearch(model); break;
			// 한국
			case "HK": hankookPlaceSearch(model); break;
			// 홍원
			case "HW": hongwonPlaceSearch(model); break;
			// 깨나라
			case "CN": cnPlaceSearch(model); break;
		}
	}

	private void moorimPlaceSearch(Model model){
		String domainUrl = "https://neozone.moorim.co.kr";
		ArrayList<PaperMakerDeliverPlace> placeList = new ArrayList<>();
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "moorim").get("cookie");
			String CSRFToken = stockManager.paperMakerGet(employeeCode, "moorim").get("CSRFToken");
			HttpResponse<String> response = Unirest.post(domainUrl + "/popup/retrieveDestinationListPop.do")
					.header("authority", "neozone.moorim.co.kr")
					.header("content-type", "application/x-www-form-urlencoded").header("cookie", cookies)
					.field("CSRFToken", CSRFToken).field("hidPopupParam", (String) model.getAttribute("keyWord"))
					.asString();
			Elements trList = Jsoup.parse(response.getBody()).select(
					"#frmPopup > div > div > div.pop_contents > div.pop_table_box > table > tbody > tr:nth-child(n+2)");
			if(!trList.get(0).text().equals("조회된 데이터가 없습니다.")){
				for(int i=0; i<trList.size(); i++){
					Elements hiddenInputs = trList.get(i).select("td:nth-child(1) > input");
					placeList.add(PaperMakerDeliverPlace.builder().code(hiddenInputs.get(0).val())
							.name(hiddenInputs.get(1).val()).phone(hiddenInputs.get(2).val())
							.phone2(hiddenInputs.get(3).val()).address(hiddenInputs.get(4).val()).build());
				}
			}
		} catch (Exception e) {
			log.info("무림 납품처 검색 예외");
			e.printStackTrace();
		}finally {model.addAttribute("delivery", placeList);}
	}

	private void hansolPlaceSearch(Model model) {
		String domainUrl = "https://hansol.papermarketplace.co.kr/";
//		String domainUrl = "https://hansoldev.e-sang.net/";
		ArrayList<PaperMakerDeliverPlace> placeList = new ArrayList<>();
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "hansol").get("cookie");
			HttpResponse<String> response1 = Unirest.get(domainUrl + "ship/orderreq.aspx")
					.header("cookie", cookies).asString();
			Document doc = Jsoup.parse(response1.getBody());
			Map<String, Object> requestFieldMap = new HashMap<>();
			for(Element input : doc.select("#aspnetForm").select("input")) {
				if(input.hasAttr("name")) requestFieldMap.put(input.attr("name"), input.val());
			}
			requestFieldMap.put("ctl00$ctl00$ContentBody$sm", "ctl00$ctl00$ContentBody$sm|ctl00$ctl00$ContentBody$Content$ucPopDestinationSearch1$lnkSearch");
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucPopDestinationSearch1$txtDestinationName", (String) model.getAttribute("keyWord"));
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucPopStock1$ddlPaging", "10");
			requestFieldMap.put("__EVENTTARGET", "ctl00$ctl00$ContentBody$Content$ucPopDestinationSearch1$lnkSearch");
			requestFieldMap.put("__VIEWSTATE", doc.selectFirst("#__VIEWSTATE").val());
			requestFieldMap.put("__VIEWSTATEGENERATOR", doc.selectFirst("#__VIEWSTATEGENERATOR").val());
			requestFieldMap.put("__EVENTVALIDATION", doc.selectFirst("#__EVENTVALIDATION").val());
			requestFieldMap.put("__ASYNCPOST", "true");

			HttpResponse<String> response2 = Unirest.post(domainUrl + "ship/orderreq.aspx")
					.header("cookie", cookies)
					.header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Whale/3.22.205.26 Safari/537.36")
					.contentType("application/x-www-form-urlencoded; charset=UTF-8")
					.fields(requestFieldMap)
					.asString();
			Document doc2 = Jsoup.parse(response2.getBody());
			Elements trs = doc2.select("#tblDestination > tbody > tr:nth-child(n+2)");
			for(Element tr: trs) {
				Element a = tr.selectFirst("td:nth-child(2)").selectFirst("a");
				placeList.add(PaperMakerDeliverPlace.builder()
						.code(a.attr("kunwe"))
						.name(a.attr("kunwenm"))
						.address(a.attr("ort01") + a.attr("stras"))
						.phone(a.attr("kunwe_tel"))
						.phone2(a.attr("cellphone"))
						.etc(a.attr("zipcode"))
						.build());
			}
		}catch (Exception e) { e.printStackTrace();
		}finally{model.addAttribute("delivery", placeList);}
	}

	private void hankookPlaceSearch(Model model){
		String domainUrl = "http://www.x-pri.co.kr:8008/uBoard";
		ArrayList<PaperMakerDeliverPlace> placeList = new ArrayList<>();
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "hankook").get("cookie");
			Map<String, Object> field = new HashMap<>();
			field.put("searchType", "N");
			field.put("schType", "");
			field.put("schTxt", (String) model.getAttribute("keyWord"));
			field.put("customerId", "5006");
			JSONObject fields = new JSONObject(field);
			HttpResponse<JsonNode> response = Unirest.post(domainUrl + "/common/searchDestination.ub")
					.header("content-type", "application/json; charset=UTF-8")
					.header("cookie", cookies)
					.body(fields)
					.asJson();

			ArrayList<HashMap<String, String>> places = mapper.readValue(response.getBody().toString(), new TypeReference<>() {});
			for(HashMap<String, String> place : places) {
				placeList.add(
						PaperMakerDeliverPlace.builder()
						.code(place.get("deliveryToCode"))
						.name(place.get("deliveryToName"))
						.address(place.get("address"))
						.phone(place.get("telNo"))
						.build()
						);
			}
		}catch (Exception e) { e.printStackTrace(); }
		finally {model.addAttribute("delivery", placeList);}
	}
	
	private void hongwonPlaceSearch(Model model){
		ArrayList<PaperMakerDeliverPlace> placeList = new ArrayList<>();
		try {
			String domainUrl = "http://b2b.hongwon.com";
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "hongwon").get("cookie");
			HttpResponse<JsonNode> response = Unirest.post(domainUrl + "/distmastko539/selectListDistMastKo539OptionJson.do")
					.header("cookie", cookies)
					.header("Content-Type", "application/x-www-form-urlencoded")
					.field("searchBpCd", "10003")
					.field("searchDistNm", (String)model.getAttribute("keyWord"))
					.asJson();
			HashMap<String, Object> places = mapper.readValue(response.getBody().toString(), new TypeReference<>() {});
			for(HashMap<String, String> place : (ArrayList<HashMap<String, String>>)places.get("rows")) {
				placeList.add(
						PaperMakerDeliverPlace.builder()
						.code(place.get("DIST_CD"))
						.name(place.get("DIST_NM"))
						.address(place.get("DIST_DC"))
						.phone(place.get("TEL_NO"))
						.build()
						);
			}
		}catch (Exception e) {e.printStackTrace();}
		finally {model.addAttribute("delivery", placeList);}
	}

	private void cnPlaceSearch(Model model) {
		String domainUrl = "http://ioms.dhpulp.co.kr/";
		ArrayList<PaperMakerDeliverPlace> placeList = new ArrayList<>();
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "cn").get("cookie");
			String requestCookies = new StringBuffer()
			.append(cookies)
			.append("tagIdx=1;")
			.append("tagIdx2=0;")
			.append("leftAct=1")
			.toString();
			HttpResponse<String> response = Unirest.post(domainUrl + "common/common/supplierPop.dev")
					.header("cookie", requestCookies)
					.contentType("application/x-www-form-urlencoded")
					.field("devonTargetRow", "1")
					.field("devonOrderBy", "")
					.field("rows", "")
					.field("custCd", "")
					.field("name", (String) model.getAttribute("keyWord"))
					.field("teln", "")
					.field("addr", "")
					.asString();
			Document doc = Jsoup.parse(response.getBody());
			Elements trs = doc.select("#ContentsBox > div > div > div:nth-child(3) > table > tbody > tr");
			for(Element tr : trs) {
				Elements tds = tr.select("td");
				placeList.add(PaperMakerDeliverPlace.builder()
						.code(tds.get(0).text())
						.name(tds.get(1).text())
						.address(tds.get(2).text())
						.phone(tds.get(3).text())
						.build());
			}
		} catch (Exception e) {e.printStackTrace();
		}finally {model.addAttribute("delivery", placeList);}
	}
	
	private void paperMakerOrder(Model model) {
		log.info(model.getAttribute("filedValue").toString());
		switch ((String) model.getAttribute("pmCode")) {
			case "HS": case "HA": case "HP": hansolOrder(model); break;
			case "MP": case "MS": case "MR": moorimOrder(model); break;
			case "HK": hankookOrder(model); break;
			case "HW": hongwonOrder(model); break;
			case "CN": cnOrder(model); break;
		}
	}

	private void moorimOrder(Model model){
		String domainUrl = "https://neozone.moorim.co.kr";
		String buComment = (String) model.getAttribute("buComment");
		PaperMakerDeliverPlace delivery = (PaperMakerDeliverPlace) model.getAttribute("PaperMakerDeliverPlace");
		ArrayList<MoorimFiledValue> mFiledValues = ((PaperMakerFiledValue) model.getAttribute("filedValue")).getMR();
		ArrayList<String> responseValues = new ArrayList<>();
		ArrayList<String> mappingValues = new ArrayList<>();
		ArrayList<Object> result = new ArrayList<>();
		boolean success = false;
		String resultMsg = null;
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "moorim").get("cookie");
			String CSRFToken = stockManager.paperMakerGet(employeeCode, "moorim").get("CSRFToken");
			
			for (MoorimFiledValue mFiledValue : mFiledValues) {
				HttpResponse<String> response = Unirest.post(domainUrl + "/orderAjax/retrieveMTSOInfo.do")
						.header("authority", "neozone.moorim.co.kr")
						.header("content-type", "application/x-www-form-urlencoded").header("cookie", cookies)
						.field("CSRFToken", CSRFToken).field("callFlag", mFiledValue.getCallflage())
						.field("werks", mFiledValue.getWerks()).field("lgort", mFiledValue.getLgort())
						.field("matnr", mFiledValue.getMatnr()).field("kunnr", "100028") // 신승 코드
						.field("zpkid", mFiledValue.getZpkid()).field("scmng", mFiledValue.getScmng())
						.field("parem", mFiledValue.getParem()).field("grade", mFiledValue.getGrade()) // 지종
						.asString();
				Element body = Jsoup.parse(response.getBody());
				Element hiddenInput = body.selectFirst("div.fixed_table > table > tbody > tr > input[type=hidden]");
				responseValues.add(hiddenInput.val());
			}

			StringBuffer fields = new StringBuffer()
					.append("CSRFToken=" + CSRFToken + "&")
					.append("clickMenuId1=" + "5150" + "&")
					.append("clickMenuId2=" + "5200" + "&")
					.append("clickMenuName=" + "주문서작성" + "&")
					.append("openTopYn=" + "Y" + "&")
					.append("openLeftYn=" + "Y" + "&")
					.append("I_KUNNR=" + "100028" + "&")
					.append("iKunweNm=" + delivery.getName() + "&")
					.append("I_KUNWE=" + delivery.getCode() + "&")
					.append("iTelNo=" + delivery.getPhone() + "&")
					.append("iTelNo2=" + delivery.getPhone2() + "&")
					.append("iAddress=" + delivery.getAddress() + "&")
					.append("txtDeliveryDate=" + (String) model.getAttribute("date") + "&")
					.append("selTime=" + (String) model.getAttribute("time") + "&");
			for (int i = 0; i < responseValues.size(); i++) {
				/* 상품별 field 시작 */
				String[] field = responseValues.get(i).split("\\|");
				fields.append("rtnBasketChk=" + "on" + "&");
				fields.append("itemIndex=" + Integer.toString(i) + "&");
				fields.append("isSave=" + "Y" + "&");
				fields.append("txtBasketQty=" + mFiledValues.get(i).getQty() + "&");
				fields.append("rtnGrade=" + mFiledValues.get(i).getGrade() + "&");
				fields.append("rtnAuart=" + field[0] + "&");
				fields.append("rtnWerks=" + field[1] + "&");
				fields.append("rtnLgort=" + field[2] + "&");
				fields.append("rtnMatnr=" + field[3] + "&");
				fields.append("rtnSpart=" + field[4] + "&");
				fields.append("rtnPosnr=" + field[6] + "&");
				fields.append("rtnMaktx=" + field[7] + "&");
				fields.append("rtnWerksTx=" + field[8] + "&");
				fields.append("rtnLgortTx=" + field[9] + "&");
				fields.append("rtnCharg=" + field[10] + "&");
				fields.append("rtnVrkme=" + field[11] + "&");
				fields.append("rtnLfimg=" + field[12] + "&");
				fields.append("rtnUmrez=" + field[13] + "&");
				fields.append("rtnUmren=" + field[14] + "&");
				fields.append("rtnZpkid=" + field[15] + "&");
				fields.append("rtnScmng=" + field[16] + "&");
				fields.append("rtnParem=" + field[17] + "&");
				StringBuffer txtBasketEtc = new StringBuffer()
						.append("txtBasketEtc=");
				if(i == 0 && buComment != null)txtBasketEtc.append(buComment+ " ");
				if(mFiledValues.get(i).getRmrk() != null) txtBasketEtc.append((mFiledValues.get(i).getRmrk()) + "&");
				fields.append(txtBasketEtc);
				if(i != responseValues.size() - 1) fields.append("rtnAllParam=" + responseValues.get(i) + "&");
				else fields.append("rtnAllParam=" + responseValues.get(i));
			}
			HttpResponse<String> response = Unirest.post(domainUrl + "/order/cuShipmentRequest.do")
					.header("authority", "neozone.moorim.co.kr")
					.header("content-type", "application/x-www-form-urlencoded").header("cookie", cookies)
					.header("origin", "https://neozone.moorim.co.kr").body(fields.toString()).asString();
			String location = response.getHeaders().getFirst("Location");
			
			HttpResponse<String> response2 = Unirest.get(domainUrl + "/" + location)
					.header("cookie", cookies)
					.asString();
			Element responseBody = Jsoup.parse(response2.getBody());
			Elements trList = responseBody.select(
					"#frmSalesOrderCon > div:nth-child(8) > div > div.table_box.fixed_body > table > tbody > tr");
			
			StringBuffer fields2 = new StringBuffer()
					.append("CSRFToken=" + CSRFToken + "&")
					.append("clickMenuId1=" + "5150" + "&")
					.append("clickMenuId2=" + "5200" + "&")
					.append("clickMenuName=" + "주문서작성" + "&")
					.append("openTopYn=" + "Y" + "&")
					.append("openLeftYn=" + "Y" + "&")
					.append("KUNWE=" + delivery.getCode() + "&");
			
			JSONArray itemList = new JSONArray();
			try {
				for(int i=0; i<trList.size(); i+=2) {
					Elements tdList = trList.get(i).select("td");
					mappingValues.add(tdList.get(3).text() + "-" + tdList.get(4).text());
					Elements hiddenInputs = tdList.get(10).select("input");
					Element qtyInput = tdList.get(6).selectFirst("input");
					JSONObject item = new JSONObject();
					item.put("itemIndex", hiddenInputs.select("input[name=itemIndex]").get(0).val());
					item.put("hidGrade", hiddenInputs.select("input[name=hidGrade]").get(0).val());
					item.put("hidShipKunag", hiddenInputs.select("input[name=hidShipKunag]").get(0).val());
					item.put("hidShipVstel", hiddenInputs.select("input[name=hidShipVstel]").get(0).val());
					item.put("hidShipNtgew", hiddenInputs.select("input[name=hidShipNtgew]").get(0).val());
					item.put("hidShipLgort", hiddenInputs.select("input[name=hidShipLgort]").get(0).val());
					itemList.put(item);

					fields2.append("txtShipQty=" + qtyInput.val() + "&");  // 수량
					fields2.append("itemIndex=" + hiddenInputs.select("input[name=itemIndex]").get(0).val() + "&");
					fields2.append("hidShipUpdateFlag=" + "N&");
					fields2.append("hidGrade=" + hiddenInputs.select("input[name=hidGrade]").get(0).val() + "&"); // 제품코드
					fields2.append("hidShipKunag=" + hiddenInputs.select("input[name=hidShipKunag]").get(0).val() + "&");
					fields2.append("hidShipVkorg=" + hiddenInputs.select("input[name=hidShipVkorg]").get(0).val() + "&");
					fields2.append("hidShipVbeln=" + hiddenInputs.select("input[name=hidShipVbeln]").get(0).val() + "&");
					fields2.append("hidShipPosnr=" + hiddenInputs.select("input[name=hidShipPosnr]").get(0).val() + "&");
					fields2.append("hidShipAuart=" + hiddenInputs.select("input[name=hidShipAuart]").get(0).val() + "&");
					fields2.append("hidShipLgort=" + hiddenInputs.select("input[name=hidShipLgort]").get(0).val() + "&");
					fields2.append("hidShipAudat=" + hiddenInputs.select("input[name=hidShipAudat]").get(0).val() + "&");
					fields2.append("hidShipIntim=" + hiddenInputs.select("input[name=hidShipIntim]").get(0).val() + "&");
					fields2.append("hidShipVstel=" + hiddenInputs.select("input[name=hidShipVstel]").get(0).val() + "&");
					fields2.append("hidShipEtctext=" + hiddenInputs.select("input[name=hidShipEtctext]").get(0).val() + "&");
					fields2.append("hidShipWerksTx=" + hiddenInputs.select("input[name=hidShipWerksTx]").get(0).val() + "&");
					fields2.append("hidShipLgortTx=" + hiddenInputs.select("input[name=hidShipLgortTx]").get(0).val() + "&");
					fields2.append("hidShipNtgew=" + hiddenInputs.select("input[name=hidShipNtgew]").get(0).val() + "&");
					fields2.append("hidShipZpkid=" + hiddenInputs.select("input[name=hidShipZpkid]").get(0).val() + "&");
					fields2.append("hidShipScmng=" + hiddenInputs.select("input[name=hidShipScmng]").get(0).val() + "&");
					fields2.append("hidShipParem=" + hiddenInputs.select("input[name=hidShipParem]").get(0).val() + "&");
				}
			}catch (IndexOutOfBoundsException e) {log.info("매핑코드 추출 완료");}
			fields2.append("hidZeugnt=" + "");
			// 유효성 확인
			HttpResponse<JsonNode> response3 = Unirest.post(domainUrl+"/orderAjax/retrieveValidShipReqCom.do")
					.header("authority", "neozone.moorim.co.kr")
					.header("content-type", "application/x-www-form-urlencoded")
					.header("cookie", cookies)
					.field("CSRFToken", CSRFToken)
					.field("KUNWE", delivery.getCode())
					.field("itemList", itemList.toString())
					.asJson();
			if(response3.getStatus() != 500){
				// 실제 주문
				HttpResponse<String> response4 = Unirest.post(domainUrl+"/order/createShipReqCom.do")
						.header("authority", "neozone.moorim.co.kr")
						.header("content-type", "application/x-www-form-urlencoded")
						.header("cookie", cookies)
						.header("origin", "https://neozone.moorim.co.kr")
						.body(fields2.toString())
						.asString();
				if(response4.getStatus() == 302){
					success = true;
					resultMsg = "무림 주문 성공";
				}
				else {
					resultMsg = "무림 주문 실패";
					throw new UnirestException(resultMsg);
				}
			}else {
				resultMsg = "무림 유효성 검증 실패";
				throw new UnirestException(resultMsg);
			}
		} catch (Exception e) { e.printStackTrace();}
		BuyB resultData = (success) ?convertToCube(model, mappingValues) :null;
		result.add(resultData);
		result.add(success);
		result.add(resultMsg);
		model.addAttribute("result", result);
	}

	private void hansolOrder(Model model){
		String domainUrl = "https://hansol.papermarketplace.co.kr/";
//		String domainUrl = "https://hansoldev.e-sang.net/";
		String buComment = (String) model.getAttribute("buComment");
		ArrayList<HansolFiledValue> hFiledValues = ((PaperMakerFiledValue) model.getAttribute("filedValue")).getHS();
		PaperMakerDeliverPlace delivery = (PaperMakerDeliverPlace) model.getAttribute("PaperMakerDeliverPlace");
		ArrayList<String> mappingValues = new ArrayList<>();
		ArrayList<Object> result = new ArrayList<>();
		boolean success = false;
		String resultMsg = "한솔 주문 실패";
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String employeeName = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeName();
			String cookies = stockManager.paperMakerGet(employeeCode, "hansol").get("cookie");
			HttpResponse<String> response1 = Unirest.get(domainUrl + "ship/orderreq.aspx")
					.header("cookie", cookies).asString();
			Document doc = Jsoup.parse(response1.getBody());
			String viewState = doc.selectFirst("#__VIEWSTATE").val();
			String viewStateGenerator = doc.selectFirst("#__VIEWSTATEGENERATOR").val();
			String eventValidation = doc.selectFirst("#__EVENTVALIDATION").val();
			for(HansolFiledValue hFieldValue: hFiledValues) {
				Map<String, Object> requestFieldMap = new HashMap<>();
				requestFieldMap.put("ctl00$ctl00$ContentBody$sm", "ctl00$ctl00$ContentBody$Content$upnlList|ctl00$ctl00$ContentBody$Content$lnkAddOrderItem");
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdMAKTX",
						hFieldValue.getMAKTX()); // 자재내역
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdZKTXT",
						hFieldValue.getZXTXT()); // 배치내역
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdMATNR",
						hFieldValue.getMATNR()); // 자재번호
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdCHARG",
						hFieldValue.getCHARG()); // 배치번호
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdSTD_WEIGHT",
						hFieldValue.getSTDWEIGHT()); // 표준중량
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdLGORT",
						hFieldValue.getLGORT()); // 저장위치
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdGEWEI",
						hFieldValue.getGEWEI()); // 중량단위
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdVRKME",
						hFieldValue.getVRKME()); // 수량단위
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdPOSNR",
						hFieldValue.getPOSNR()); // 주문생산품목번호 (아트원)
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdStockType",
						hFieldValue.getStockType()); // 재고 구분 1: 공용, 2: 주문, 3: 보관
				// 주문생산번호 (아트원)
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdVBELN",
						(hFieldValue.getVBELN() != null) ?hFieldValue.getVBELN() :"");
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdWERKS",
						hFieldValue.getWERKS()); // 플랜트
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdSPART",
						hFieldValue.getSPART()); // 제품군
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdITEM2",
						hFieldValue.getITEM2()); // 지종
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdSPEC1",
						hFieldValue.getSPEC1()); // 평량
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdSPEC2",
						hFieldValue.getSPEC2()); // 가로
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdSPEC3",
						hFieldValue.getSPEC3()); // 세로
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdSTOCKQTY",
						hFieldValue.getSTOCKQTY()); // 재고수량
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdSTOCKWGT",
						hFieldValue.getSTOCKWGT()); // 재고중량
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdMAKER",
						hFieldValue.getMAKER()); // 제조사
				requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdITEM3",
						hFieldValue.getITEM3()); // 포장
				requestFieldMap.put("__EVENTTARGET", "ctl00$ctl00$ContentBody$Content$lnkAddOrderItem");
				requestFieldMap.put("__VIEWSTATE", viewState);
				requestFieldMap.put("__VIEWSTATEGENERATOR", viewStateGenerator);
				requestFieldMap.put("__EVENTVALIDATION", eventValidation);
				requestFieldMap.put("__ASYNCPOST", "true");
				HttpResponse<String> responseLoop = Unirest.post(domainUrl + "ship/orderreq.aspx")
						.header("cookie", cookies)
						.header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Whale/3.22.205.26 Safari/537.36")
						.contentType("application/x-www-form-urlencoded; charset=UTF-8")
						.fields(requestFieldMap)
						.asString();
				Document docLoop = Jsoup.parse(responseLoop.getBody());
				Element body = docLoop.selectFirst("body");
				String values = body.childNodes().get(body.childNodes().size()-1).toString();
				String[] value = values.split("\\|");
				viewState = value[16];
				viewStateGenerator = value[20];
				eventValidation = value[24];
			}
			Map<String, Object> requestFieldMap = new HashMap<>();
			requestFieldMap.put("__EVENTTARGET", "ctl00$ctl00$ContentBody$Content$lnkOrder");
			requestFieldMap.put("__VIEWSTATE", viewState);
			requestFieldMap.put("__VIEWSTATEGENERATOR", viewStateGenerator);
			requestFieldMap.put("__EVENTVALIDATION", eventValidation);
			requestFieldMap.put("__ASYNCPOST", "true");
			requestFieldMap.put("ctl00$ctl00$ContentBody$sm", "ctl00$ctl00$ContentBody$sm|ctl00$ctl00$ContentBody$Content$lnkOrder");
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$esnDate", (String) model.getAttribute("date"));
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$selHour", (String) model.getAttribute("time"));
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucSearchOrderingOrganization1$txtCpyDesc",
					buComment); // 원발주처
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucSearchDestination1$txtName",
					delivery.getName()); // 납품처명
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucSearchDestination1$txtAddress",
					delivery.getAddress()); // 납품처 주소
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucSearchDestination1$hdCode",
					delivery.getCode()); // 납품처 코드?
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucSearchDestination1$hdZipCode",
					delivery.getEtc()); // 납품처 zip 코드
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucSearchPhoneNo1$txtPhoneNo1",
					delivery.getPhone().split("-")[0]);
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucSearchPhoneNo1$txtPhoneNo2",
					delivery.getPhone().split("-")[1]);
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$ucSearchPhoneNo1$txtPhoneNo3",
					(delivery.getPhone().split("-").length > 2) ?delivery.getPhone().split("-")[2] :"");
			for(int i=0; i<hFiledValues.size(); i++) {
				String preFix = "ctl00$ctl00$ContentBody$Content$rptList$ctl0";
				requestFieldMap.put(preFix + i + "$hdSubstitutionRate", "");
				requestFieldMap.put(preFix + i + "$hdMATNR_B", "");
				requestFieldMap.put(preFix + i + "$hdCHARG_B", "");
				requestFieldMap.put(preFix + i + "$hdMAKER11", hFiledValues.get(i).getMAKER());
				// 1 = 공용, 2 = 주문, 9 = 보관
				requestFieldMap.put(preFix + i + "$hdStockTypeList", hFiledValues.get(i).getStockType());
				// 주문 수량
				requestFieldMap.put(preFix + i + "$txtReqQty", hFiledValues.get(i).getQty());
				// 주문 중량
				requestFieldMap.put(preFix + i + "$txtReqWeight", hFiledValues.get(i).getWeight());
				requestFieldMap.put(preFix + i + "$chkConsignment",
						(hFiledValues.get(i).getLGORT_TO() != null) ?"on" : ""); // 적송
				requestFieldMap.put(preFix + i + "$selLGORT_TO",
						(hFiledValues.get(i).getLGORT_TO() != null) ?hFiledValues.get(i).getLGORT_TO() :""); // 적송
				requestFieldMap.put(preFix + i + "$RowTaComment",
						(hFiledValues.get(i).getRmrk() != null) ?hFiledValues.get(i).getRmrk() :""); // 유의사항
			}
			requestFieldMap.put("ctl00$ctl00$ContentBody$Content$hdRowCount",
					hFiledValues.size());
			HttpResponse<String> response2 = Unirest.post(domainUrl + "ship/orderreq.aspx")
					.header("cookie", cookies)
					.header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Whale/3.22.205.26 Safari/537.36")
					.contentType("application/x-www-form-urlencoded; charset=UTF-8")
					.fields(requestFieldMap)
					.asString();
			Element body2 = Jsoup.parse(response2.getBody()).selectFirst("body");
			String values = body2.childNodes().get(body2.childNodes().size()-1).toString();
			String[] value = values.split("\\|");
			if(value[56].split("'")[1].split(" ")[0].equals("발주의뢰")){
				HttpResponse<String> response3 = Unirest.get(domainUrl + "progress/orderreqlist.aspx")
						.header("cookie", cookies).asString();
				Document doc2 = Jsoup.parse(response3.getBody());
				Map<String, Object> afterRequestFieldMap = new HashMap<>();
				afterRequestFieldMap.put("ctl00$ctl00$ContentBody$sm", "ctl00$ctl00$ContentBody$sm|ctl00$ctl00$ContentBody$Content$lnkSearch");
				afterRequestFieldMap.put("__EVENTTARGET", "ctl00$ctl00$ContentBody$Content$lnkSearch");
				afterRequestFieldMap.put("__VIEWSTATE", doc2.selectFirst("#__VIEWSTATE").val());
				afterRequestFieldMap.put("__VIEWSTATEGENERATOR", doc2.selectFirst("#__VIEWSTATEGENERATOR").val());
				afterRequestFieldMap.put("__EVENTVALIDATION", doc2.selectFirst("#__EVENTVALIDATION").val());
				afterRequestFieldMap.put("__ASYNCPOST", "true");
				afterRequestFieldMap.put("Fromctl00$ctl00$ContentBody$Content_ctl00$ctl00$ContentBody$Content$esnDate",
						LocalDate.now());
				afterRequestFieldMap.put("Toctl00$ctl00$ContentBody$Content_ctl00$ctl00$ContentBody$Content$esnDate",
						LocalDate.now());
				afterRequestFieldMap.put("Fromctl00$ctl00$ContentBody$Content_ctl00$ctl00$ContentBody$Content$arrivalDate",
						(String) model.getAttribute("date"));
				afterRequestFieldMap.put("ctl00$ctl00$ContentBody$Content$txtArrival",
						"");
				afterRequestFieldMap.put("ctl00$ctl00$ContentBody$Content$txtWriter", employeeName);
				afterRequestFieldMap.put("ctl00$ctl00$ContentBody$Content$ddlSearchType", "0");
				afterRequestFieldMap.put("ctl00$ctl00$ContentBody$Content$ddlPaging", "0");
				afterRequestFieldMap.put("ctl00$ctl00$ContentBody$Content$chkListStatus$0", "on");
				afterRequestFieldMap.put("ctl00$ctl00$ContentBody$Content$chkListStatus$1", "on");
				HttpResponse<String> response4 = Unirest.post(domainUrl + "progress/orderreqlist.aspx")
						.header("cookie", cookies)
						.header("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Whale/3.22.205.26 Safari/537.36")
						.contentType("application/x-www-form-urlencoded; charset=UTF-8")
						.fields(afterRequestFieldMap)
						.asString();
				Document doc3 = Jsoup.parse(response4.getBody());
				Elements trs = doc3.select("tbody > tr");
				Elements ths = trs.get(0).select("th");
				HashMap<String, Integer> headerIndexMap = new HashMap<String, Integer>();
				for(int i=0; i<ths.size(); i++){
					if(!ths.get(i).text().isEmpty()) headerIndexMap.put(ths.get(i).text(), i);
				}
				for(HansolFiledValue fieldValue : hFiledValues) {
					for(Element tr: trs.subList(1, trs.size())) {
						try {
							Elements tds = tr.select("td");
							DecimalFormat decimalFormat = new DecimalFormat("0.00");
							if(
									fieldValue.getITEM2NM().equals(tds.get(headerIndexMap.get("지종")).text())
									&& fieldValue.getZXTXT().equals(tds.get(headerIndexMap.get("배치내역")).text())
									&& fieldValue.getSPEC1().equals(tds.get(headerIndexMap.get("평량")).text())
									&& fieldValue.getSPEC2().equals(tds.get(headerIndexMap.get("가로")).text())
									&& fieldValue.getSPEC3().equals(tds.get(headerIndexMap.get("세로")).text())
									&& decimalFormat.format(Double.parseDouble(fieldValue.getQty())).equals(
										tds.get(headerIndexMap.get("오더수량")).text().trim())
									&& tds.get(headerIndexMap.get("도착지")).text().equals(delivery.getName())
							){
								mappingValues.add(tds.get(headerIndexMap.get("대리점 No")).text());
								break;
							}
						}catch(Exception e){
								e.printStackTrace();
								log.info("tr = {}", tr.text());
							}
						}
				}
				if(!mappingValues.isEmpty()){
					success = true;
					resultMsg = "한솔 주문 성공";
				}
				else {
					resultMsg = "한솔 주문매핑 실패";
					throw new UnirestException(resultMsg);
				}
			}else {
				resultMsg = "한솔 주문 실패";
				throw new UnirestException(resultMsg);
			}
		}catch (Exception e) {e.printStackTrace();
		}finally {
			BuyB resultData = (success) ?convertToCube(model, mappingValues) :null;
			result.add(resultData);
			result.add(success);
			result.add(resultMsg);
			model.addAttribute("result", result);
		}
	}

	private void hankookOrder(Model model){
		String domainUrl = "http://www.x-pri.co.kr:8008/uBoard";
		ArrayList<Object> result = new ArrayList<>();
		boolean success = false;
		String resultMsg = null;
		ArrayList<String> mappingValues = new ArrayList<>();
		HashMap<String, String> headerVo = new HashMap<>();
		ArrayList<HankookFiledValue> linesVo = new ArrayList<>();
		try {
			String buComment = (String) model.getAttribute("buComment");
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "hankook").get("cookie");
			PaperMakerDeliverPlace delivery = (PaperMakerDeliverPlace) model.getAttribute("PaperMakerDeliverPlace");
			ArrayList<HankookFiledValue> fieldValues = ((PaperMakerFiledValue)model.getAttribute("filedValue")).getHK();

			StringBuffer headerRemark = new StringBuffer();
			for(Integer i=0; i<fieldValues.size(); i++) {
				HankookFiledValue hk = fieldValues.get(i);
				if (hk.getRmrk() != null) headerRemark.append(hk.getRmrk() + " ");
				switch (hk.getAllWgtNm()) {
					case "파주물류":
						hk.setAllWgt(hk.getPjWgt());
						hk.setFromCenterCode("91387");
						break;
					case "오봉물류":
						hk.setAllWgt(hk.getObWgt());
						hk.setFromCenterCode("59710");
						break;
					case "온산물류":
						hk.setAllWgt(hk.getOsWgt());
						hk.setFromCenterCode("59711");
						break;
				}

				Map<String, Object> field = new HashMap<>();
				field.put("gramSqMeter", hk.getGramSqMeter());
				field.put("paperTypeCode", hk.getPaperTypeCode());
				field.put("rowIndex", i);
				field.put("sizeX", hk.getSizeX());
				field.put("sizeY", hk.getSizeY());
				field.put("unit", hk.getUnit());
				if(hk.getNormalReqQty() != null){
					field.put("target", "sumJungsangCustHkpWeight");
					field.put("transReqQty", hk.getAllWgt());
					JSONObject fields = new JSONObject(field);
					// 선택 수량 필드
					// 센터 수량
					HttpResponse<JsonNode> response = Unirest.post(domainUrl + "/web/production/qtyToWeight.ub")
							.header("content-type", "application/json; charset=UTF-8")
							.header("cookie", cookies)
							.body(fields)
							.asJson();
					// 선택 수량
					fields.put("target", "normalReqWeight");
					fields.put("transReqQty", hk.getNormalReqQty());
					HttpResponse<JsonNode> response2 = Unirest.post(domainUrl + "/web/production/qtyToWeight.ub")
							.header("content-type", "application/json; charset=UTF-8")
							.header("cookie", cookies)
							.body(fields)
							.asJson();
					HashMap<String, String> responseMap = mapper.readValue(response.getBody().toString(), new TypeReference<>() {
					});
					HashMap<String, String> responseMap2 = mapper.readValue(response2.getBody().toString(), new TypeReference<>() {
					});
					hk.setSumJungsangCustHkpAmount(hk.getAllWgt());
					hk.setSumJungsangCustHkpWeight(responseMap.get("weight"));
					hk.setNormalReqWeight(responseMap2.get("weight"));

					hk.setTotalJungsangCustHkpAmount(hk.getNormalReqQty());
					hk.setTotalJungsangCustHkpWeight(responseMap2.get("weight"));
					hk.setDeliveryType("0");

				}
				// 센터 수량 필드

				// 보관 재고 수량이 있으면
				if (hk.getStoreReqQty() != null) {
					field.put("target", "boganWeight");
					field.put("transReqQty", hk.getBoganCust());
					JSONObject fields = new JSONObject(field);
					HttpResponse<JsonNode> response3 = Unirest.post(domainUrl + "/web/production/qtyToWeight.ub")
							.header("content-type", "application/json; charset=UTF-8")
							.header("cookie", cookies)
							.body(fields)
							.asJson();
					fields.put("target", "storeReqWeight");
					fields.put("transReqQty", hk.getStoreReqQty());
					HttpResponse<JsonNode> response4 = Unirest.post(domainUrl + "/web/production/qtyToWeight.ub")
							.header("content-type", "application/json; charset=UTF-8")
							.header("cookie", cookies)
							.body(fields)
							.asJson();
					HashMap<String, String> responseMap3 = mapper.readValue(response3.getBody().toString(), new TypeReference<>() {
					});
					HashMap<String, String> responseMap4 = mapper.readValue(response4.getBody().toString(), new TypeReference<>() {
					});

					hk.setBoganWeight(responseMap3.get("weight"));
					hk.setStoreReqWeight(responseMap4.get("weight"));
					if(hk.getTotalJungsangCustHkpAmount() != null){
						hk.setDeliveryType("2");
						hk.setTotalJungsangCustHkpAmount(
								String.valueOf(
										Float.parseFloat(hk.getTotalJungsangCustHkpAmount()) +
												Float.parseFloat(hk.getStoreReqQty())
								)
						);
					}
					else{
						hk.setDeliveryType("1");
						hk.setTotalJungsangCustHkpAmount(hk.getStoreReqQty());
						hk.setSumJungsangCustHkpAmount("0");
					}
					if(hk.getTotalJungsangCustHkpWeight() != null) { // 중량
						hk.setTotalJungsangCustHkpWeight(
								String.valueOf(
										Float.parseFloat(hk.getTotalJungsangCustHkpWeight()) +
										Float.parseFloat(responseMap4.get("weight"))
								)
						);
					}
					else hk.setTotalJungsangCustHkpWeight(responseMap4.get("weight"));
				}
				hk.setCustomerId("5006");
				linesVo.add(hk);
			}
			headerVo.put("attribute1", "N");
			headerVo.put("attribute2", "");
			headerVo.put("customerId", "5006");
			headerVo.put("customerNum", "203268");
			headerVo.put("deliveryToCode", delivery.getCode());
			headerVo.put("originalUse", buComment);
			headerVo.put("salesType", "1");
			headerVo.put("sourceType", "W");
			headerVo.put("strTransReqDate", (String)model.getAttribute("date"));
			headerVo.put("transReqType", "S");
			headerVo.put("headerRemark", headerRemark.toString());
			JSONArray voList = new JSONArray(linesVo);
			JSONObject voMap2 = new JSONObject(headerVo);
			JSONObject voString = new JSONObject();
			voString.remove("qty");
			voString.remove("clickedCenter");
			voString.remove("rmrk");
			voString.put("linesVo", voList);
			voString.put("headerVo", voMap2);

			HttpResponse<JsonNode> response3 = Unirest.post(domainUrl + "/web/production/requestDataValidation.ub")
					.header("content-type", "application/json; charset=UTF-8")
					.header("cookie", cookies)
					.body(voString)
					.asJson();
			HashMap<String, String> responseMap5 = mapper.readValue(response3.getBody().toString(), new TypeReference<>() {});
			if(responseMap5.get("success").equals("true")) {
				HttpResponse<String> response4 = Unirest.post(domainUrl + "/web/production/requestDataInsert.ub")
						.header("content-type", "application/json; charset=UTF-8")
						.header("cookie", cookies)
						.body(voString)
						.asString();
				if(response4.isSuccess()) {
					for(HankookFiledValue hk :fieldValues){
						StringBuffer mappingValue = new StringBuffer().
								append((String)model.getAttribute("date"))
								.append("|")
								.append(delivery.getName())
								.append("|")
								.append(hk.getPaperSname())
								.append("|")
								.append(hk.getGramSqMeter())
								.append("|")
								.append(hk.getTotalJungsangCustHkpAmount())
								;
						mappingValues.add(mappingValue.toString());
					}
					success = true;
					resultMsg = "한국 주문 성공";
				}else {
					resultMsg = "한국 주문 실패";
					throw new UnirestException(resultMsg);
				}
			}else {
				resultMsg = "한국 주문 유효성 검증 실패";
				throw new UnirestException(resultMsg);
			}
		}catch (Exception e) {e.printStackTrace();
		}finally {
			BuyB resultData = (success) ?convertToCube(model, mappingValues) :null;
			result.add(resultData);
			result.add(success);
			result.add(resultMsg);
			model.addAttribute("result", result);
		}
	}

	private void hongwonOrder(Model model){
		String domainUrl = "http://b2b.hongwon.com";
		boolean success = false;
		String resultMsg = "홍원 주문 성공";
		ArrayList<Object> result = new ArrayList<>();
		ArrayList<String> mappingValues = new ArrayList<>();
		ArrayList<String> requestFieldValues = new ArrayList<>();
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "hongwon").get("cookie");
			String buComment = (String) model.getAttribute("buComment");
			PaperMakerDeliverPlace delivery = (PaperMakerDeliverPlace) model.getAttribute("PaperMakerDeliverPlace");
			ArrayList<HongwonFiledValue> fieldValues = ((PaperMakerFiledValue)model.getAttribute("filedValue")).getHW();
			for(HongwonFiledValue hw : fieldValues) {
				String jumunField = new StringBuffer()
						.append((String)model.getAttribute("date"))
						.append("||")
						.append(hw.getItemCd())
						.append("||")
						.append(delivery.getCode())
						.append("||")
						.append(hw.getQty())
						.append("||")
						.append(hw.getWeight())
						.append("||")
						.append((fieldValues.indexOf(hw) == 0) ?buComment + " " :"")
						.append((hw.getRmrk() != null) ?hw.getRmrk() :"")
						.toString();
				requestFieldValues.add(jumunField);

				String mappingValue = new StringBuffer().
						append((String)model.getAttribute("date"))
						.append("|")
						.append(delivery.getName())
						.append("|")
						.append(hw.getItemName())
						.append("|")
						.append(hw.getItemCd().substring(5, 8))
						.append("|")
						.append(hw.getQty())
						.toString();
				mappingValues.add(mappingValue);
			}
			HttpResponse<JsonNode> response = Unirest.post(domainUrl + "/jumun/insertJumun.do")
					.header("cookie", cookies)
					.header("Content-Type", "application/x-www-form-urlencoded")
					.field("jumunArray", requestFieldValues)
					.asJson();
			if(response.isSuccess()) success = true;
			else {
				resultMsg = "홍원 주문 실패";
				throw new UnirestException("홍원 주문 실패");
			}
			HashMap<String, Object> responseMap = mapper.readValue(response.getBody().toString(), new TypeReference<>() {});
//			log.info(responseMap.toString());
		}catch (Exception e) {e.printStackTrace();
		}finally {
			BuyB resultData = null;
			if(success) resultData = convertToCube(model, mappingValues);
			result.add(resultData);
			result.add(success);
			result.add(resultMsg);
			model.addAttribute("result", result);
		}
	}

	private void cnOrder(Model model) {
		String domainUrl = "http://ioms.dhpulp.co.kr/";
		boolean success = false;
		String resultMsg = "깨나라 주문 실패";
		ArrayList<Object> result = new ArrayList<>();
		ArrayList<String> mappingValues = new ArrayList<>();
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			String cookies = stockManager.paperMakerGet(employeeCode, "cn").get("cookie");
			String requestCookies = new StringBuffer()
					.append(cookies)
					.append("tagIdx=0;")
					.append("tagIdx2=0;")
					.append("leftAct=1")
					.toString();
			String buComment = (String) model.getAttribute("buComment");
			PaperMakerDeliverPlace delivery = (PaperMakerDeliverPlace) model.getAttribute("PaperMakerDeliverPlace");
			ArrayList<DhpulpFiledValue> fieldValues = ((PaperMakerFiledValue)model.getAttribute("filedValue")).getCN();

			Map<String, Object> requestField = new HashMap<>();
			requestField.put("column", "prodCd,chulQty,chulWeight,transProdCd,origOrderNo,posnr,qty,zQty,werks,lgort");
			requestField.put("custCd", "0000101027");
			StringBuffer dataBuffer = new StringBuffer();
			for(DhpulpFiledValue fieldValue : fieldValues) {
				dataBuffer.append(fieldValue.getProdCd() + ",");
				dataBuffer.append(fieldValue.getChulQty()+ ",");
				dataBuffer.append(fieldValue.getChulWeight() + ",");
				dataBuffer.append(fieldValue.getTransProdCd() + ",");
				dataBuffer.append(fieldValue.getOrigOrderNo() + ",");
				dataBuffer.append(fieldValue.getPosnr() + ",");
				dataBuffer.append(fieldValue.getQty() + ",");
				dataBuffer.append(fieldValue.getZQty() + ",");
				dataBuffer.append(fieldValue.getWerks() + ",");
				dataBuffer.append(fieldValue.getLgort());
				dataBuffer.append("/");
			}
			dataBuffer.deleteCharAt(dataBuffer.length()-1);
			requestField.put("data", dataBuffer.toString());

			HttpResponse<String> response1 = Unirest.post(domainUrl + "ioms/paper/order/order/stockAddCart.ajax")
					.header("cookie", requestCookies)
					.fields(requestField)
					.contentType("application/x-www-form-urlencoded")
					.asString();
			String response1Msg = Jsoup.parse(response1.getBody()).selectFirst("xsync").text().trim().substring(0, 2);
			if(response1.isSuccess() && response1Msg.equals("정상")) {
				String requestCookies2 = new StringBuffer()
						.append(cookies)
						.append("tagIdx=1;")
						.append("tagIdx2=0;")
						.append("leftAct=1")
						.toString();
				HttpResponse<String> response2 = Unirest.get(domainUrl + "ioms/paper/order/order/orderCart.dev?tagIdx=1&tagIdx2=0&leftAct=1")
						.header("cookie", requestCookies2)
						.asString();
				if(response2.isSuccess()) {
					Document doc = Jsoup.parse(response2.getBody());
					StringBuffer requestField2 = new StringBuffer();
					requestField2.append("hiddenToken=" + doc.selectFirst("#hiddenToken").val() + "&");
					requestField2.append("custCd=" + "0000101027" + "&");
					requestField2.append("supplierCd=" + delivery.getCode() + "&");
					requestField2.append("supplierNm=" + delivery.getName() + "&");
					requestField2.append("supplierDate=" + ((String)model.getAttribute("date")).replace("-", "") + "&");
					requestField2.append("supplierTimeHh=" + (String) model.getAttribute("time") + "&");
					requestField2.append("supplierTimeMm=" + "0001" + "&");
					requestField2.append("supplierTel=" + delivery.getPhone() + "&");
					requestField2.append("supplierHpTel=" + "" + "&");
					StringBuffer supplierMemo = new StringBuffer()
							.append("supplierMemo=" + buComment);
					Elements trStocks = doc.select("#oform .grid_area:not(:nth-child(2)) tbody tr");
					int stockIdx = 1;
					for(int i=0;i<trStocks.size();i+=2){
						if(trStocks.get(i).text().equals("표시할 내용이 없습니다.")){
							i--; continue;
						}
						Element tr = trStocks.get(i);
						Elements hiddenInputs = tr.select("input[type=hidden]");
						String chulWeight = trStocks.get(i+1).selectFirst("input[name=chulWeight]").val();
						String chulQty = tr.selectFirst("input[name=chulQty]").val();
						for(Element hiddenInput: hiddenInputs) {
							if(hiddenInput.attr("name").equals("channel")){
								for(DhpulpFiledValue fieldValue : fieldValues) {
									if(hiddenInputs.get(2).val().equals(fieldValue.getProdCd())){
										chulWeight = fieldValue.getChulWeight();
										chulQty = fieldValue.getChulQty();
										requestField2.append("channel=10&");
										requestField2.append("oCheck=" + tr.selectFirst("input[name=oCheck]").val() + "&");
										if(!fieldValue.getRmrk().isEmpty()) supplierMemo.append(" " + fieldValue.getRmrk());
									}
								}
							}else requestField2.append(hiddenInput.attr("name") + "=" + hiddenInput.val() + "&");
						}
						requestField2.append("chulQty=" + chulQty + "&");
						requestField2.append("chulWeight=" + chulWeight + "&");
						if(i == trStocks.size()-2)	requestField2.append(supplierMemo);
					}
					HttpResponse<String> response3 = Unirest.post(domainUrl + "ioms/paper/order/order/orderDecide.dev")
							.header("cookie", requestCookies2)
							.contentType("application/x-www-form-urlencoded")
							.body(requestField2.toString())
							.asString();
					if(response3.isSuccess()) {
						Document doc2 = Jsoup.parse(response3.getBody());
						Elements trs = doc2.select("#prodReq tbody tr");
						success = true;
						resultMsg = "깨나라 주문 성공";
						int trsIdx = 0;
						for(DhpulpFiledValue fieldValue: fieldValues) {
							Elements tds = trs.get(trsIdx).select("td");
							log.info("주문 저장 여부 : {} 여신 : {}", trs.get(trsIdx + 3).select("td:nth-child(2)").text().split(" ")[0].trim().equals("(S)"),
									trs.get(trsIdx + 4).select("td:nth-child(2)").text().split(" ")[0].trim().equals("(A)"));
							mappingValues.add(tds.get(1).text().trim() + "|"
									+ fieldValue.getProdCd() + "|"
									+ fieldValue.getChulQty());
							trsIdx += 5;
						}
					}
					if(mappingValues.isEmpty()) {
						resultMsg = "깨나라 주문 실패";
						throw new UnirestException(resultMsg);
					}
				}else {
					resultMsg = "깨나라 페이지 이동 실패";
					throw new UnirestException(resultMsg);
				}
			}else {
				resultMsg = "깨나라 카트 담기 실패";
				throw new UnirestException(resultMsg);
			}
		}catch(Exception e) { e.printStackTrace();
		}finally {
			BuyB resultData = null;
			if(success) resultData = convertToCube(model, mappingValues);
			result.add(resultData);
			result.add(success);
			result.add(resultMsg);
			model.addAttribute("result", result);
		}
	}

	// 발주 테이블 insert 위한 빈 제작
	private BuyB convertToCube(Model model, ArrayList<String> toBeanList) {
		String paperMakerReg = (String) model.getAttribute("paperMakerReg");
		BuyB bean = (BuyB) model.getAttribute("buyB");
		try {
			String employeeCode = ((EmployeeBean)this.utills.getAttribute("myInfo")).getEmployeeCode();
			for(int i=0; i<bean.getBuyDetail().size(); i++) {
				BuyDetail detail = bean.getBuyDetail().get(i);
				detail.setSequence(i+1);
				detail.setMappingCode(toBeanList.get(i));
			}
			bean.setWantDate((String) model.getAttribute("date"));
			bean.setWantTime((String) model.getAttribute("time"));
			bean.setStackYn(false);
			bean.setEmCode(employeeCode);
			bean.setPurchasePartnerCode(paperMakerReg);
			bean.setStateCode("O1");
		}catch (Exception e) {e.printStackTrace();}
		return bean;
	}
	
}
