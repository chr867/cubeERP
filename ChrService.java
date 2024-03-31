package com.sinseungpaper.cube.Services;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionException;
import org.springframework.ui.Model;

import com.sinseungpaper.cube.beans.BuyDeadLineDetail;
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
import com.sinseungpaper.cube.beans.PartnerAddItems;
import com.sinseungpaper.cube.beans.PartnerB;
import com.sinseungpaper.cube.beans.PartnerCreditDetail;
import com.sinseungpaper.cube.beans.PartnerFileB;
import com.sinseungpaper.cube.common.Encryption;
import com.sinseungpaper.cube.common.SimpleTransactionManager;
import com.sinseungpaper.cube.common.TransactionAssistant;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ChrService extends TransactionAssistant{
	@Autowired
	private Encryption enc;
	public void apiBackCtl(Model model, String serviceCode) {
		switch(serviceCode) {
		case "0":
			this.mo10Init(model);
			break;
		case "1":
			this.mo10Search(model);
			break;
		case "3":
			this.mo10ManufactureModify(model);
			break;
		case "4":
			this.mo10CheckScheduleReply(model);
			break;
		case "5":
			this.mo10GetPartnerAddItems(model);
			break;
			
		case "10":
			this.mo30Init(model);
			break;
		case "11":
			this.mo30RequestCheckSchedule(model);
			break;
		case "12":
			this.mo30ManufactureRegister(model);
			break;
		case "13":
			this.mo30SelectCheckPriceReply(model);
			break;
		case "14":
			this.mo30GetPartnerAddItems(model);
			break;
		case "15":
			this.mo30ProposalAppendMapping(model);
			break;
			
		case "20":
			this.ds50Init(model);
			break;
		case "21":
			this.ds50Submit(model);
			break;
		case "22":
			this.ds50SubmitPartner(model);
			break;
		case "23":
			this.ds50ModifyPartner(model);
			break;
		case "24":
			this.ds50RegistPartner(model);
			break;
			
		case "30":
			this.cl10Searching(model);
			break;
		case "31":
			this.cl10InsertBuyDeadLine(model);
			break;
		default:
		}
	}

	/* (생산발주) 생산 */
	private void mo10Init(Model model) {
		Mo10Bean mo10Bean = null;
		try {
			this.tranStart(true);
			mo10Bean = Mo10Bean.builder()
					.createInfoBean(cubeSession.selectList("selectManufactureOrder"))
					.checkPriceBean(cubeSession.selectList("selectCheckprice"))
					.build();
			this.commit();
			for(CheckPriceB bean : mo10Bean.getCheckPriceBean()) {
				if(bean.getChEmnamedsale() != null) bean.setChEmnamedsale(enc.aesDecode(bean.getChEmnamedsale(), "bxtpigroup"));
			}
			for(CreateB bean : mo10Bean.getCreateInfoBean()) {
				if(bean.getCaEmname() != null) bean.setCaEmname(enc.aesDecode(bean.getCaEmname(), "bxtpigroup"));
			}
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e){this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo10Bean", mo10Bean);
		}
	}

	/* (생산발주) 생산 생산의뢰 검색 */
	private void mo10Search(Model model) {
		Mo10Bean mo10Bean = null;
		CreateSearchB param = (CreateSearchB)model.getAttribute("create");
		log.info("param = {}", param);
		try {
			this.tranStart(true);
			mo10Bean = Mo10Bean.builder()
					.createInfoBean(cubeSession.selectList("searchManufactureOrder", param))
					.build();
			this.commit();
			for(CreateB bean : mo10Bean.getCreateInfoBean()) {
				if(bean.getCaEmname() != null) bean.setCaEmname(enc.aesDecode(bean.getCaEmname(), "bxtpigroup"));
			}
		}catch(TransactionException t){t.printStackTrace();
		}catch(Exception e){this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo10Bean", mo10Bean);
		}
		
	}

	/* (생산발주) 생산 생산 비고, 담당자 update */
	private void mo10ManufactureModify(Model model) {
		Mo10Bean mo10Bean = null;
		try {
			this.tranStart(false);
			cubeSession.update("updateManufactureOrder", (CreateB)model.getAttribute("create"));
			cubeSession.update("updateManufactureDetail", (CreateDetail)model.getAttribute("createDetail"));
			mo10Bean = Mo10Bean.builder()
					.createInfoBean(cubeSession.selectList("selectManufactureOrder"))
					.build();
			for(CreateB bean: mo10Bean.getCreateInfoBean()) {
				bean.setCaEmname(enc.aesDecode(bean.getCaEmname(), "bxtpigroup"));
			}
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo10Bean", mo10Bean);
		}
	}
	
	/* (생산발주) 생산 단가확인 요청 회신 */
	private void mo10CheckScheduleReply(Model model) {
		Mo10Bean mo10Bean = null;
		try {
			this.tranStart(false);
			CheckPriceB check = (CheckPriceB)model.getAttribute("check");
			cubeSession.update("updateCheckSchedule", check);
			mo10Bean = Mo10Bean.builder()
					.checkPriceBean(cubeSession.selectList("selectCheckprice"))
					.build();
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo10Bean", mo10Bean);
		}
	}
	
	private void mo10GetPartnerAddItems(Model model) {
		Mo10Bean mo10Bean = null;
		try {
			this.tranStart(true);
			mo10Bean = Mo10Bean.builder()
					.saleBean(cubeSession.selectList("selectPartnerSale", (String)model.getAttribute("partnerCode")))
					.loanBean(cubeSession.selectOne("selectPartnerLoan", (String)model.getAttribute("partnerCode")))
					.build();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo10Bean", mo10Bean);
		}
	}
	
	/* (생산발주) 의뢰 */
	private void mo30Init(Model model) {
		Mo30Bean mo30Bean = null;
		try {
			this.tranStart(true);
			mo30Bean = Mo30Bean.builder()
					.checkPriceRequest(cubeSession.selectList("selectCheckprice"))
					.manufactureProposal(cubeSession.selectList("selectManufactureProposal"))
					.build();
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e){this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo30Bean", mo30Bean);
		}
	}

	/* (생산발주) 의뢰 단가확인 요청 발신 */
	private void mo30RequestCheckSchedule(Model model) {
		Mo30Bean mo30Bean = null;
		CheckPriceBList param = (CheckPriceBList)model.getAttribute("checkBeanList");
		try {
			this.tranStart(false);
			for(CheckPriceB bean: param.getCheckBeanList()) {
				cubeSession.insert("insertCheckSchedule", bean);
			}
			mo30Bean = Mo30Bean.builder()
					.checkPriceRequest(cubeSession.selectList("selectCheckprice"))
					.build();
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo30Bean", mo30Bean);
		}
	};
		
	/* (생산발주) 의뢰 단가확인 요청 회신 SELECT*/
	private void mo30SelectCheckPriceReply(Model model) {
		Mo30Bean mo30Bean = null;
		try {
			this.tranStart(true);
			mo30Bean = Mo30Bean.builder()
					.checkPriceReply(
							cubeSession
							.selectList("selectCheckScheduleReply", (CheckPriceB)model.getAttribute("check")))
							.build();
			this.commit();
			for(CheckPriceB bean : mo30Bean.getCheckPriceReply()) {
				if(bean.getChEmnamedbuy() != null) bean.setChEmnamedbuy(enc.aesDecode(bean.getChEmnamedbuy(), "bxtpigroup"));
			}
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e){this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo30Bean", mo30Bean);
		}
	}
	
	/* (생산발주) 의뢰 생산의뢰 등록 */
	private void mo30ManufactureRegister(Model model) {
		Mo30Bean mo30bean = null;
		try {
			this.tranStart(false);
			CreateB create = (CreateB)model.getAttribute("create");
			String poDatetime = cubeSession.selectOne("insertCreateProposal");
			String caCode = cubeSession.selectOne("insertCreateOrder", create);
			ArrayList<CreateDetail> createDetails = create.getCreateDetailsArg();
			for(CreateDetail bean : createDetails) {
				bean.setCdCacode(caCode);
				bean.setCdPodatetime(poDatetime);
				cubeSession.insert("insertCreateOrderDetail", bean);
			}
			/* 첨부내용 테이블 INSERT*/
			HashMap<String, String> params = new HashMap<>();
			params.put("poDatetime", poDatetime);
			params.put("caCode", caCode);
			cubeSession.insert("insertCreateMapping", params);
			/* 단가요청 테이블 DELETE */
			ArrayList<String> chDateTimes = (ArrayList<String>) model.getAttribute("chDateTimes");
			chDateTimes.forEach(chDateTime -> cubeSession.delete("deleteCheckPrice", chDateTime));
			
			mo30bean = Mo30Bean.builder()
			.manufactureProposal(cubeSession.selectList("selectManufactureProposal"))
			.build();
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo30Bean", mo30bean);
		}
	}
	
	private void mo30GetPartnerAddItems(Model model) {
		Mo30Bean mo30Bean = null;
		try {
			this.tranStart(true);
			mo30Bean = Mo30Bean.builder()
					.loanBean(cubeSession.selectOne("selectPartnerLoan", (String)model.getAttribute("partnerCode")))
					.build();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo30Bean", mo30Bean);
		}
	}
	
	private void mo30ProposalAppendMapping(Model model) {
		Mo30Bean mo30Bean = null;
		try {
			this.tranStart(true);
			mo30Bean = Mo30Bean.builder()
					.proposalAppend(cubeSession.selectList("selectManufactureDetailProPosal", (String)model.getAttribute("poDateTime")))
					.build();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("mo30Bean", mo30Bean);
		}
	}
	
	/* (대시보드) 기업심사 */
	private void ds50Init(Model model) {
		Ds50Bean ds50Bean = null;
		try {
			this.tranStart(true);
			ds50Bean = Ds50Bean.builder()
					.partnerList(cubeSession.selectList("selectPartnerAudit"))
					.build();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("ds50Bean", ds50Bean);
		}
	}
	
	/* (대시보드) 기업심사 품의 완료 거래처 */
	private void ds50SubmitPartner(Model model) {
		Ds50Bean ds50Bean = null;
		try {
			this.tranStart(true);
			ds50Bean = Ds50Bean.builder()
					.partnerList(cubeSession.selectList("selectPartnerRegistration"))
					.build();
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("ds50Bean", ds50Bean);
		}
	}
	
	/* (대시보드) 기업심사 수정 거래처 신용정보*/
	private void ds50ModifyPartner(Model model) {
		Ds50Bean ds50Bean = null;
		try {
			this.tranStart(true);
			ds50Bean = Ds50Bean.builder()
					.partnerList(cubeSession.selectList("selectPartnerModify", model.getAttribute("partner")))
					.build();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("ds50Bean", ds50Bean);
		}
	}
	
	/* (대시보드) 기업심사 신용 정보 저장 */
	private void ds50Submit(Model model) {
		PartnerB partner = (PartnerB)model.getAttribute("partner");
		log.info("partner = {}", partner);
		Ds50Bean ds50Bean = null;
		try {
			this.tranStart(false);
			/* 거래상태 */
			cubeSession.insert("insertPartnerCreditState", partner.getPartnerCreditState().get(0));
			/* 여신이력 */
			cubeSession.insert("insertPartnerCreditLog", partner.getPartnerCreditLog().get(0));
			/* 품의 승인, 다음 결재자 요청 */
			cubeSession.update("submitProposal", partner.getPrCode());
			cubeSession.update("updateProposal", partner.getPrCode());
			
			/* 신용 정보 insert */
			for(PartnerCreditDetail bean : partner.getPartnerCreditDetail()) {
				log.info("creditDetailParam = {}", bean);
				cubeSession.insert("insertPartnerCreditDetail", bean);
			}
			/* 추가 정보 insert */
			for(PartnerAddItems bean : partner.getPartnerAddItems()) {
				log.info("addItemtsParam = {}", bean);
				cubeSession.insert("insertPartnerAddItems", bean);
			}
			ds50Bean = Ds50Bean.builder()
					.partnerList(cubeSession.selectList("selectPartnerAudit", (PartnerB)model.getAttribute("partner")))
					.build();
			this.partnerFilesUpload(model);
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("ds50Bean", ds50Bean);
		}
	}

	/* 품의 끝난 거래처 등록 */
	private void ds50RegistPartner(Model model) {
		PartnerB partner = (PartnerB)model.getAttribute("partner");
		log.info("partner = {}", partner);
		Ds50Bean ds50Bean = null;
		try {
			this.tranStart(false);
			/* 거래상태 */
			cubeSession.insert("insertPartnerCreditState", partner.getPartnerCreditState().get(0));
			/* 여신이력 */
			cubeSession.insert("insertPartnerCreditLog", partner.getPartnerCreditLog().get(0));
			/* partner Table state */
			cubeSession.update("updatePartnerState", partner.getPrCode());
			/* 신용 정보 insert */
			for(PartnerCreditDetail bean : partner.getPartnerCreditDetail()) {
				log.info("creditDetailParam = {}", bean);
				cubeSession.insert("insertPartnerCreditDetail", bean);
			}
			/* 추가 정보 insert */
			for(PartnerAddItems bean : partner.getPartnerAddItems()) {
				log.info("addItemtsParam = {}", bean);
				cubeSession.insert("insertPartnerAddItems", bean);
			}
			ds50Bean = Ds50Bean.builder()
					.partnerList(cubeSession.selectList("selectPartnerAudit", (PartnerB)model.getAttribute("partner")))
					.build();
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("ds50Bean", ds50Bean);
		}
	}

	/* 매입 마감 */
	private void cl10Searching(Model model) {
		Cl10Bean cl10Bean = null;
		HashMap<String, String> param = new HashMap<>();
		param.put("prCode", (String)model.getAttribute("partnerCode"));
		if((String)model.getAttribute("date") != null) param.put("date", (String)model.getAttribute("date"));
		log.info("{}", param.toString());
		try {
			this.tranStart(true);
			cl10Bean = Cl10Bean.builder()
					.buyList(cubeSession.selectList("selectBuyList", param))
					.avreage(cubeSession.selectList("selectDiscountAverage", ((String)param.get("date").replace("-", ""))))
					.build();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			log.info("{}", cl10Bean.toString());
			model.addAttribute("cl10Bean", cl10Bean);
		}
	}
	
	/* 매입 마감 */
	private void cl10InsertBuyDeadLine(Model model) {
		Cl10Bean cl10Bean = null;
		BuyDeadLineDetailList detailList = (BuyDeadLineDetailList)model.getAttribute("arg");
		try {
			this.tranStart(false);
			for(BuyDeadLineDetail detail : detailList.getArg()) {
				cubeSession.insert("insertBuyDeadLine", detail);
			}
			cl10Bean = Cl10Bean.builder()
				.build();
			this.commit();
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {this.rollback(); e.printStackTrace();
		}finally {
			this.tranEnd();
			model.addAttribute("cl10Bean", cl10Bean);
		}
	}
	
	private void partnerFilesUpload(Model model) {
		PartnerFileB files = (PartnerFileB)model.getAttribute("fileB");
		HashMap<String, String> msg = new HashMap<String, String>();
		HttpServletRequest request = (HttpServletRequest)model.getAttribute("request");
		String root = request.getSession().getServletContext().getRealPath("/");
		try {
			for(int i=0; i<files.getFiles().size(); i++) {
				/* 파일 저장할 경로 생성 */
				StringBuffer savePath = new StringBuffer()
						.append(root)
						.append("resources/files/")
						.append(files.getPrCode());
				File saveDir = new File(savePath.toString());
				if(!saveDir.exists()) saveDir.mkdir();
				
				/* 파일 저장 */
				StringBuffer path = new StringBuffer()
						.append("resources/files/")
						.append(files.getPrCode())
						.append("/")
						.append(files.getFilesInfo().get(i))
						.append(".pdf");
					File saveFile = new File(root + path.toString());
					if(!saveFile.exists()) saveFile.mkdir();
					files.getFiles().get(i).transferTo(saveFile);
					HashMap <String, String> param = new HashMap<String, String>();
					param.put("prCode", files.getPrCode());
					param.put("filePath", path.toString());
					param.put("piCode", files.getPiCode().get(i));
					cubeSession.insert("insertPartnerFiles", param);
			}
			msg.put("msg", "성공");
		}catch(TransactionException t){ t.printStackTrace();
		}catch(Exception e) {
			this.rollback();
			e.printStackTrace();
			msg.put("msg", "실패");
		}finally {
			model.addAttribute("msg", msg);
		}
	}

}
