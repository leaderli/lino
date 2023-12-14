@ResponseBody
	@RequestMapping(value = "/msgQueryBatch", method = RequestMethod.POST, produces = "application/json;charset=UTF-8")
	public String msgQueryBatch(@RequestBody QrRequest request) {
		InterfaceEnum interfaceEnum = InterfaceEnum.market_queryBatch;
		String respStr = "";

		QrRespBo<MarketMsgQueryResp> respBo = new QrRespBo<MarketMsgQueryResp>();
		long startMillis = System.currentTimeMillis();
		try {
			/**1.0 获取请求对象 */
			QrReqBo<MarketMsgQueryReq> reqBo = orgSignService.checkSignAndGetReq(request, MarketMsgQueryReq.class,
					interfaceEnum);

			/**2.0  处理业务逻辑*/
			respBo = marketService.batchQuery(reqBo);

			/** 3.0 加签和返回*/
			respStr = orgSignService.signRsaAndResp(request, respBo);

		} catch (AppException e) {
			log.error("market queryBatch. exception : " + e.getMessage(), e);
			respBo.setBack(e.getCode(), e.getMessage());

			respStr = orgSignService.signRsaAndResp(request, respBo);
		} catch (Exception e) {

			log.error("market queryBatch. exception : " + e.getMessage(), e);
			respBo.setBack(ErEnum.PF, "[" + e.getMessage() + "]");

			respStr = orgSignService.signRsaAndResp(request, respBo);
		} finally {
			log.info("==={}===, {}  cost time [{}] ms \n response:{}", interfaceEnum.getMsg(), interfaceEnum.getCode(),
					(System.currentTimeMillis() - startMillis), respStr);
			MDC.remove("sysUUID");
		}
		return respStr;
	}