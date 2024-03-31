package com.sinseungpaper.cube;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sinseungpaper.cube.Services.ChrService;
import com.sinseungpaper.cube.beans.BuyDeadLineDetailList;
import com.sinseungpaper.cube.beans.CheckPriceB;
import com.sinseungpaper.cube.beans.CheckPriceBList;
import com.sinseungpaper.cube.beans.Cl10Bean;
import com.sinseungpaper.cube.beans.CreateB;
import com.sinseungpaper.cube.beans.CreateDetail;
import com.sinseungpaper.cube.beans.CreateSearchB;
import com.sinseungpaper.cube.beans.Ds50Bean;
import com.sinseungpaper.cube.beans.Mo10Bean;
import com.sinseungpaper.cube.beans.Mo30Bean;
import com.sinseungpaper.cube.beans.PartnerB;
import com.sinseungpaper.cube.beans.PartnerFileB;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController

public class ChrAPIController {
	@Autowired
	private ChrService cs;

	/* (생산발주) 생산 */
	@PostMapping("/MO10INIT")
	public Mo10Bean mo10Init(Model model) {
		cs.apiBackCtl(model, "0");
		
		return (Mo10Bean)model.getAttribute("mo10Bean");
	}

	/* (생산발주) 생산 생산의뢰 검색 */
	@PostMapping("/MO10SEARCH")
	public Mo10Bean mo10Search(Model model, @ModelAttribute CreateSearchB create){
		model.addAttribute("create", create);
		cs.apiBackCtl(model, "1");
		
		return (Mo10Bean)model.getAttribute("mo10Bean");
	}
	
	/* (생산발주) 생산 생산 비고, 담당자 update */
	@PostMapping("/MO10CREATEMODIFY")
	public Mo10Bean mo10ManufactureModify(Model model, @ModelAttribute CreateB create,
			@ModelAttribute CreateDetail createDetail) {
		model.addAttribute("create", create);
		model.addAttribute("createDetail", createDetail);
		cs.apiBackCtl(model, "3");
		
		return (Mo10Bean)model.getAttribute("mo10Bean");
	}
	
	/* (생산발주) 생산 단가확인 요청 회신 */
	@PostMapping("/MO10CHECKSCHEDULESUBMIT")
	public Mo10Bean mo10CheckScheduleSubmit(Model model, @ModelAttribute CheckPriceB check) {
		model.addAttribute("check", check);
		cs.apiBackCtl(model, "4");
		return (Mo10Bean)model.getAttribute("mo10Bean");
	}
	
	/* (생산발주) 거래처 신용등급, 매출이력 */
	@PostMapping("/MO10GETPARTNERADDITEMS")
	public Mo10Bean mo10GetPartnerAddItems(Model model, String partnerCode) {
		model.addAttribute("partnerCode", partnerCode);
		cs.apiBackCtl(model, "5");
		
		return (Mo10Bean)model.getAttribute("mo10Bean");
	}
	
	/* (생산발주) 의뢰 */
	@PostMapping("/MO30INIT")
	public Mo30Bean mo30Init(Model model) {
		cs.apiBackCtl(model, "10");
		log.info("Mo30Bean = {}", (Mo30Bean)model.getAttribute("mo30Bean"));
		return (Mo30Bean)model.getAttribute("mo30Bean");
	}

	/* (생산발주) 의뢰 단가확인 요청 발신 */
	@PostMapping("/MO30REQUESTCHECKPRICE")
	public Mo30Bean mo30RequestCheckPrice(Model model, @ModelAttribute CheckPriceBList checkBeanList) {
		model.addAttribute("checkBeanList", checkBeanList);
		cs.apiBackCtl(model, "11");
		
		return (Mo30Bean)model.getAttribute("mo30Bean");
	}
	
	/* (생산발주) 의뢰 생산의뢰 등록 */
	@PostMapping("/MO30MANUFACTUREREGISTER")
	public Mo30Bean mo30ManufactureRegister(Model model, @ModelAttribute CreateB create, @RequestParam ArrayList<String> chDateTimes) {
		model.addAttribute("create", create);
		model.addAttribute("chDateTimes", chDateTimes);
		cs.apiBackCtl(model, "12");

		return (Mo30Bean)model.getAttribute("mo30Bean");
	}

	/* (생산발주) 의뢰 단가확인 요청 회신 */
	@PostMapping("/MO30SELECTCHECKPRICEREPLY")
	public Mo30Bean mo30SelectCheckpriceReply(Model model, @ModelAttribute CheckPriceB check) {
		model.addAttribute("check", check);
		cs.apiBackCtl(model, "13");
		
		return (Mo30Bean)model.getAttribute("mo30Bean");
	}
	
	@PostMapping("/MO30GETPARTNERADDITEMS")
	public Mo30Bean mo30GetPartnerAddItems(Model model, String partnerCode) {
		model.addAttribute("partnerCode", partnerCode);
		cs.apiBackCtl(model, "14");
		
		return (Mo30Bean)model.getAttribute("mo30Bean");
	}
	
	@PostMapping("/MO30PROPOSALAPPENDMAPPING")
	public Mo30Bean mo30ProposalAppendMapping(Model model, String poDateTime) {
		model.addAttribute("poDateTime", poDateTime);
		cs.apiBackCtl(model, "15");
		return (Mo30Bean)model.getAttribute("mo30Bean");
	}
	
	/* (대시보드) 기업심사 */
	@PostMapping("/DS50INIT")
	public Ds50Bean ds50Init(Model model) {
		cs.apiBackCtl(model, "20");
		
		return (Ds50Bean)model.getAttribute("ds50Bean");
	}
	
	/* (대시보드) 기업심사 거래처 품의 신용정보 입력 */
	@PostMapping("/DS50SUBMITCREDIT")
	public Ds50Bean ds50Submit(Model model, @ModelAttribute PartnerB partner, @ModelAttribute PartnerFileB fileB,
			HttpServletRequest request) {
		model.addAttribute("partner", partner);
		model.addAttribute("fileB", fileB);
		model.addAttribute("request", request);
		cs.apiBackCtl(model, "21");
		
		return (Ds50Bean)model.getAttribute("ds50Bean");
	}
	
	/* (대시보드) 기업심사 품의가 끝난 거래처 목록 */
	@PostMapping("/DS50SUBMITPARTNER")
	public Ds50Bean ds50SubmitPartner(Model model) {
		cs.apiBackCtl(model, "22");
		
		return(Ds50Bean)model.getAttribute("ds50Bean");
	}
	
	/* (대시보드) 기업심사 수정할 거래처 정보 */
	@PostMapping("/DS50MODIFYPARTNER")
	public Ds50Bean ds50ModifyPartner(Model model, @ModelAttribute PartnerB partner) {
		model.addAttribute("partner", partner);
		cs.apiBackCtl(model, "23");
		
		return(Ds50Bean)model.getAttribute("ds50Bean");
	}
	
	/* (대시보드) 기업심사 수정할 거래처 정보 */
	@PostMapping("/DS50REGISTPARTNER")
	public Ds50Bean ds50RegistPartner(Model model, @ModelAttribute PartnerB partner) {
		model.addAttribute("partner", partner);
		cs.apiBackCtl(model, "24");
		
		return(Ds50Bean)model.getAttribute("ds50Bean");
	}
	
	/* 매입마감 검색 */
	@PostMapping("/CL10SEARCHING")
	public Cl10Bean cl10Searching(Model model, String partnerCode, String date) {
		model.addAttribute("partnerCode", partnerCode);
		model.addAttribute("date", date);
		cs.apiBackCtl(model, "30");
		
		return (Cl10Bean)model.getAttribute("cl10Bean");
	}
	
	/* 매입마감 INSERT */
	@PostMapping("/CL10INSERTBUYDEADLINE")
	public Cl10Bean cl10InsertBuyDeadLine(Model model, @ModelAttribute BuyDeadLineDetailList arg) {
		model.addAttribute("arg", arg);
		cs.apiBackCtl(model, "31");
		
		return (Cl10Bean)model.getAttribute("cl10Bean");
	}
}
