package com.sinseungpaper.cube;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinseungpaper.cube.Services.ScrappingService;
import com.sinseungpaper.cube.beans.BuyB;
import com.sinseungpaper.cube.beans.CenterStockBean;
import com.sinseungpaper.cube.beans.Originals;
import com.sinseungpaper.cube.beans.PaperMakerDeliverPlace;
import com.sinseungpaper.cube.beans.PaperMakerFiledValue;
import com.sinseungpaper.cube.beans.PurchaseStockBean;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class ScrappingAPIController {
	@Autowired
	private ScrappingService ss;
	
	/* 재고 스크래핑 초기실행 */
	@PostMapping("/STOCKINIT")
	public ArrayList<Object> stockInit(Model model, String employeeCode) {
		model.addAttribute("employeeCode", employeeCode);
		ss.apiBackCtl(model, "0");
		log.info("login result = {}", (ArrayList<Object>)model.getAttribute("result"));
		return (ArrayList<Object>)model.getAttribute("result");
	}
	
	/* 재고 스크래핑 */
	@PostMapping("/STOCKTSEARCHING")
	public ArrayList<Object> stockSearching(Model model, @ModelAttribute Originals og,
			String width, String height, String paperCode, String prCode, String range,
			String date) {
		model.addAttribute("width", width);
		model.addAttribute("height", height);
		model.addAttribute("og", og);
		model.addAttribute("prCode", prCode);
		model.addAttribute("paperCode", paperCode);
		model.addAttribute("range", range);
		model.addAttribute("date", date);
		model.addAttribute("result", new ArrayList<Object>());

		ss.apiBackCtl(model, "1");
		return (ArrayList<Object>)model.getAttribute("result");
	}
	
	/* 납품처 선택 */
	@PostMapping("/DELIVERPLACESEARCH")
	public ArrayList<PaperMakerDeliverPlace> deliveryPlaceSearch(Model model, String keyWord, String pmCode) {
		model.addAttribute("keyWord", keyWord);
		model.addAttribute("pmCode", pmCode);
		ss.apiBackCtl(model, "2");

		return (ArrayList<PaperMakerDeliverPlace>)model.getAttribute("delivery");
	}
	
	/* 제지사 주문등록 */	
	@PostMapping("/PAPERMAKERORDER")
	public ArrayList<Object> paperMakerOrder(Model model, 
			String pmCode, String date, String time, String buComment,
			String paperMakerReg, String salesPartnerCode,
			@ModelAttribute PaperMakerFiledValue filedValue,
			@ModelAttribute PaperMakerDeliverPlace place,
			@ModelAttribute BuyB buyB) {
		model.addAttribute("pmCode", pmCode);
		model.addAttribute("date", date);
		model.addAttribute("time", time);
		model.addAttribute("buComment", buComment);
	
		model.addAttribute("paperMakerReg", paperMakerReg);
		model.addAttribute("salesPartnerCode", salesPartnerCode);

		model.addAttribute("filedValue", filedValue);
		model.addAttribute("PaperMakerDeliverPlace", place);
		model.addAttribute("buyB", buyB);
		
		ss.apiBackCtl(model, "3");
		
		return (ArrayList<Object>) model.getAttribute("result");
	}
}
