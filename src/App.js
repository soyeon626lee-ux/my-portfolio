import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('목표 설정');
  const [currentStep, setCurrentStep] = useState(1);

  const [showAutoFillBanner, setShowAutoFillBanner] = useState(true);
  const [showHousePriceModal, setShowHousePriceModal] = useState(false);
  const [houseAddress, setHouseAddress] = useState('');
  const [stressDSR, setStressDSR] = useState(false);
  const [repaymentPeriod, setRepaymentPeriod] = useState(30);
  const [includeSavings, setIncludeSavings] = useState(false);
  
  // 목표 설정 데이터
  const [goalData, setGoalData] = useState({
    address: '',
    homePrice: 6,
    ltv: 80,
    interestRate: 0.039,
    repaymentPeriod: 30,
    monthlyIncome: 4000000,
    currentCash: 10000000,
    monthlySavings: 500000
  });

  // 챌린지 데이터
  const [challenges, setChallenges] = useState({
    coffee: true,
    taxi: false,
    subscription: false,
    dining: false
  });

  const [investment, setInvestment] = useState('mmf');

  const tabs = ['목표 설정', '자금 시뮬레이션', '저축 챌린지', '맞춤 상품 추천'];

  // 금융권 앱 UI 숫자 표기 규칙
  const formatCurrency = (amount, isSummary = false) => {
    if (isSummary && amount >= 100000000) {
      // 요약 화면에서 1억 이상은 억 단위로 축약
      const billion = Math.floor(amount / 100000000);
      const million = Math.floor((amount % 100000000) / 10000000);
      if (million > 0) {
        return `${billion}.${million}억 원`;
      }
      return `${billion}억 원`;
    }
    
    // 일반적인 경우 3자리마다 콤마 + 원
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatPercentage = (rate) => {
    // 소수점을 퍼센트로 변환 (소수점 둘째자리까지)
    return (rate * 100).toFixed(2) + '%';
  };

  const calculateResults = () => {
    const homePriceKRW = goalData.homePrice * 100000000;
    const maxLoan = Math.min(homePriceKRW * (goalData.ltv / 100), 1000000000);
    const downPayment = homePriceKRW - maxLoan;
    const monthlyRate = (goalData.interestRate + (stressDSR ? 0.015 : 0)) / 12;
    const totalPayments = goalData.repaymentPeriod * 12;
    const monthlyPayment = maxLoan * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    return {
      homePriceKRW,
      maxLoan,
      downPayment,
      monthlyPayment
    };
  };

  const results = calculateResults();

  // 총 추가 절약액 계산
  const calculateTotalSavings = () => {
    let total = 0;
    if (challenges.coffee) total += 20000;
    if (challenges.taxi) total += 30000;
    if (challenges.subscription) total += 20000;
    if (challenges.dining) total += 25000;
    return total;
  };

  const totalAdditionalSavings = calculateTotalSavings();

  // 목표 달성 기간 계산 함수
  const calculateAchievementPeriod = () => {
    const monthlySavings = goalData.monthlySavings + totalAdditionalSavings;
    const annualSavings = monthlySavings * 12;
    const investmentReturn = 0.0267; // MMF 수익률
    
    let currentAmount = goalData.currentCash + (includeSavings ? 50000000 : 0);
    let years = 0;
    
    while (currentAmount < results.downPayment && years < 50) {
      currentAmount = currentAmount * (1 + investmentReturn) + annualSavings;
      years++;
    }
    
    return years;
  };

  const achievementYears = calculateAchievementPeriod();

  const handleAutoFill = () => {
    // 마이데이터 자동채움 시뮬레이션
    setGoalData({
      ...goalData,
      monthlyIncome: 4500000,
      currentCash: 15000000,
      monthlySavings: 600000
    });
    setShowAutoFillBanner(false);
  };

  const handleHousePriceSearch = () => {
    if (houseAddress) {
      setGoalData({...goalData, homePrice: 10.1}); // 10억 1000만원
      setShowHousePriceModal(false);
    }
  };

  const renderGoalStep = () => (
    <div className="space-y-6">
      {/* 자동채움 배너 */}
      {showAutoFillBanner && (
        <div className="auto-fill-banner">
          <h3>마이데이터로 3초 만에 채우기</h3>
          <p>소득·잔액 정보를 불러와 바로 계산해 드려요.</p>
          <div className="auto-fill-buttons">
            <button onClick={handleAutoFill} className="kakao-btn kakao-btn-primary kakao-btn-small">
              동의하고 자동채움
            </button>
            <button onClick={() => setShowAutoFillBanner(false)} className="kakao-btn kakao-btn-secondary kakao-btn-small">
              다음에 할게요
            </button>
          </div>
        </div>
      )}

      <div className="kakao-card p-6 fade-in">
        <h2 className="text-xl font-bold mb-3">목표 설정</h2>
        <p className="text-sm text-gray-600 mb-6">
          원하는 집과 나의 현재 상황을 입력하세요
        </p>
        
        <div className="space-y-5">
          <div className="input-group">
            <label>주소</label>
            <p className="text-xs text-gray-600 mb-2">시뮬레이션을 돌려보고 싶은 건물의 주소를 입력하세요</p>
            <div className="input-with-button">
              <input
                type="text"
                placeholder="예: 분당내곡로 131 11층"
                value={goalData.address || ''}
                onChange={(e) => setGoalData({...goalData, address: e.target.value})}
                className="kakao-input"
              />
                              <button 
                  onClick={() => {
                    if (goalData.address) {
                      // 실거래가 조회 시뮬레이션
                      const mockPrice = Math.floor(Math.random() * 5 + 8) * 100000000; // 8억~13억 랜덤
                      if (window.confirm(`해당 실거래가 ${formatCurrency(mockPrice)}를 희망 주택가로 입력할까요?`)) {
                        setGoalData({
                          ...goalData,
                          homePrice: mockPrice / 100000000
                        });
                      }
                    } else {
                      alert('주소를 먼저 입력해주세요');
                    }
                  }}
                  className="kakao-btn kakao-btn-primary kakao-btn-small"
                >
                  가격조회
                </button>
            </div>
          </div>

          <div className="input-group">
            <label>희망 주택가 (억원)</label>
            <input
              type="number"
              value={goalData.homePrice}
              onChange={(e) => setGoalData({...goalData, homePrice: Number(e.target.value)})}
              className="kakao-input"
            />
            <p className="text-sm text-gray-600 mt-2">= {formatCurrency(goalData.homePrice * 100000000)}</p>
            <p className="tooltip-text">표시되는 금액은 공개 통계 기반의 참고용 시세예요. 실제 매물 가격과 다를 수 있어요.</p>
          </div>

          <div className="input-group">
            <label>
              담보인정비율 LTV
              <span className="tooltip-icon" title="LTV는 집값 대비 대출 비율이에요. 규제 지역/주택 유형/보유 주택 수에 따라 한도가 달라질 수 있어요.">ⓘ</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={goalData.ltv}
                onChange={(e) => setGoalData({...goalData, ltv: Number(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span className="font-semibold text-blue-600">{goalData.ltv}%</span>
                <span>100%</span>
              </div>
            </div>


            <div className="mt-4 p-4 bg-gray-50 rounded-8">
              <h4 className="text-sm font-semibold mb-3">LTV 가이드 (주택 수 기준)</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setGoalData({...goalData, ltv: 70})}
                  className="w-full text-left p-3 bg-white border border-gray-200 rounded-8 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-semibold text-sm">무주택자 · 1주택자 (생애 최초·실수요자 등)</div>
                  <div className="text-xs text-gray-600">→ 최대 70% (지역·조건에 따라 80%까지 가능)</div>
                </button>
                <button 
                  onClick={() => setGoalData({...goalData, ltv: 40})}
                  className="w-full text-left p-3 bg-white border border-gray-200 rounded-8 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-semibold text-sm">2주택 이상 보유자</div>
                  <div className="text-xs text-gray-600">→ 최대 40% (투기과열지구/조정대상지역은 규제 더 엄격)</div>
                </button>
                <button 
                  onClick={() => setGoalData({...goalData, ltv: 60})}
                  className="w-full text-left p-3 bg-white border border-gray-200 rounded-8 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-semibold text-sm">일반 평균</div>
                  <div className="text-xs text-gray-600">→ 약 60% (지역·조건 따라 다름)</div>
                </button>
              </div>
              
              <div className="mt-4 space-y-1 text-xs text-gray-600">
                <p>실제 적용 LTV는 지역(투기과열/조정/비규제), 주택 가격, 대출 목적(주담대, 생활안정자금 등)에 따라 달라집니다.</p>
                <p>주택 수가 많을수록, 규제지역일수록 대출 한도가 줄어듭니다.</p>
                <p>은행 심사와 정부 규제에 따라 실제 적용되는 비율은 달라질 수 있습니다.</p>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>주담대 금리 (연)</label>
            <div className="input-with-button">
              <input
                type="number"
                step="0.001"
                value={goalData.interestRate}
                onChange={(e) => setGoalData({...goalData, interestRate: Number(e.target.value)})}
                className="kakao-input"
              />
              <button className="kakao-btn kakao-btn-primary kakao-btn-small">
                내 신용
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">예: {formatPercentage(goalData.interestRate)}</p>
            <p className="tooltip-text">신청 시점, 상품, 신용도에 따라 금리가 달라질 수 있어요. 지금은 예상 범위를 보여드려요.</p>
          </div>

          <div className="input-group">
            <label>상환 기간 (년)</label>
            <input
              type="number"
              value={goalData.repaymentPeriod}
              onChange={(e) => setGoalData({...goalData, repaymentPeriod: Number(e.target.value)})}
              className="kakao-input"
            />
            <div className="quick-select-chips">
              {[10, 20, 30, 40].map((period) => (
                <button
                  key={period}
                  onClick={() => setGoalData({...goalData, repaymentPeriod: period})}
                  className={`quick-select-chip ${goalData.repaymentPeriod === period ? 'selected' : ''}`}
                >
                  {period}년
                </button>
              ))}
            </div>
            <p className="tooltip-text">기간이 길수록 월 상환액은 줄지만 총이자는 늘어요. 원리금균등 기준으로 계산해요.</p>
          </div>

          <div className="input-group">
            <label>월 소득</label>
            <div className="input-with-button">
              <input
                type="number"
                value={goalData.monthlyIncome}
                onChange={(e) => setGoalData({...goalData, monthlyIncome: Number(e.target.value)})}
                className="kakao-input"
              />
              <button className="kakao-btn kakao-btn-primary kakao-btn-small">
                마이데이터
              </button>
            </div>
            <p className="tooltip-text">최근 입금 내역을 기반으로 추정한 월 소득이에요. 직접 수정할 수 있어요.</p>
          </div>

          <div className="input-group">
            <label>현재 보유 현금</label>
            <div className="input-with-button">
              <input
                type="number"
                value={goalData.currentCash}
                onChange={(e) => setGoalData({...goalData, currentCash: Number(e.target.value)})}
                className="kakao-input"
              />
              <button className="kakao-btn kakao-btn-primary kakao-btn-small">
                마이데이터
              </button>
            </div>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="include-savings" 
                  checked={includeSavings} 
                  onChange={(e) => {
                    setIncludeSavings(e.target.checked);
                    if (e.target.checked) {
                      // 적금/청약 포함 시 현재 보유 현금 증가
                      setGoalData({
                        ...goalData,
                        currentCash: goalData.currentCash + 50000000 // 5천만원 추가
                      });
                    } else {
                      // 체크 해제 시 원래 금액으로 복원
                      setGoalData({
                        ...goalData,
                        currentCash: goalData.currentCash - 50000000
                      });
                    }
                  }} 
                />
                <label htmlFor="include-savings">적금/청약 포함</label>
              </div>
            </div>
            {includeSavings && (
              <div className="warning-badge">
                ⚠️ 중도 해지 시 손해/제한이 있을 수 있어요
              </div>
            )}
            <p className="tooltip-text">바로 투입 가능한 자금만 합산해요. 장기자금은 제외하는 걸 추천해요.</p>

          </div>

          <div className="input-group">
            <label>기본 월 저축</label>
            <input
              type="number"
              value={goalData.monthlySavings}
              onChange={(e) => setGoalData({...goalData, monthlySavings: Number(e.target.value)})}
              className="kakao-input"
            />
            <p className="text-sm text-blue-600 mt-2">이번 달부터 자동이체로 시작해볼까요?</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('자금 시뮬레이션')}
          className="kakao-btn kakao-btn-primary w-full mt-8"
        >
          시뮬레이션
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">입력값은 브라우저에만 저장됩니다</p>
      </div>

      <div className="kakao-card p-6 fade-in">
        <h3 className="text-lg font-bold mb-4">요약</h3>
        {goalData.address && (
          <div className="mb-4 p-3 bg-gray-50 rounded-8">
            <div className="text-sm text-gray-600">📍 {goalData.address}</div>
          </div>
        )}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="label">희망가</div>
            <div className="value">{formatCurrency(results.homePriceKRW, true)}</div>
          </div>
          <div className="summary-card">
            <div className="label">최대 대출</div>
            <div className="value">{formatCurrency(results.maxLoan, true)}</div>
          </div>
          <div className="summary-card">
            <div className="label">필요 자기자본</div>
            <div className="value">{formatCurrency(results.downPayment, true)}</div>
            <div className="text-xs text-gray-500 mt-1">(내 돈 부담액)</div>
          </div>
          <div className="summary-card">
            <div className="label">예상 월 상환액</div>
            <div className="value">{formatCurrency(Math.round(results.monthlyPayment))}</div>
            <div className="mt-2">
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={stressDSR}
                  onChange={(e) => setStressDSR(e.target.checked)}
                  className="mr-1"
                />
                스트레스 DSR 적용
                <span className="tooltip-icon ml-1" title="스트레스 DSR은 금리가 오를 때를 가정해 계산하는 보수적 기준이에요. 금리 +1.5%로 다시 계산해 드려요.">ⓘ</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-12">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">1년 전망 진행률</span>
            <span className="text-sm font-semibold text-blue-600">13%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{width: '13%'}}></div>
          </div>
          <p className="text-blue-700 text-xs mt-2">
            보유 현금 + (12×월 저축) ÷ 필요 자기자본
          </p>
        </div>
      </div>



      <div className="kakao-card p-6 fade-in">
        <h3 className="text-lg font-bold mb-4">리스크 가이드</h3>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            월 상환액이 월 소득의 35%를 넘는 경우 경고 배지 표시
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            투자 수익률은 변동 가능하며, 펀드는 원금 손실이 발생할 수 있습니다
          </li>
        </ul>
        
        <div className="mt-4 p-4 bg-red-50 rounded-12">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">월 소득</span>
            <span className="font-semibold">{formatCurrency(goalData.monthlyIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">월 상환액</span>
            <span className="font-semibold text-red-600">
              {formatCurrency(Math.round(results.monthlyPayment))}
              {stressDSR && <span className="text-xs text-orange-600 ml-1">(스트레스)</span>}
            </span>
          </div>
          <p className="text-red-600 text-sm mt-2 font-semibold">
            ▲ 상환 부담이 높습니다. 목표가/기간 조정 권고
          </p>
        </div>
      </div>

      {/* 실 주택가 모달 */}
      {showHousePriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-16 p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">주택의 예상 시세를 불러올게요</h3>
            <input
              type="text"
              placeholder="집주소를 입력하세요"
              value={houseAddress}
              onChange={(e) => setHouseAddress(e.target.value)}
              className="kakao-input mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleHousePriceSearch}
                className="kakao-btn kakao-btn-primary flex-1"
              >
                집주소 입력하기
              </button>
              <button
                onClick={() => setShowHousePriceModal(false)}
                className="kakao-btn kakao-btn-secondary flex-1"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSimulationStep = () => (
    <div className="space-y-6">
      <div className="kakao-card p-6 fade-in">
        <h2 className="text-xl font-bold mb-3">시뮬레이션 결과</h2>
        <p className="text-sm text-gray-600 mb-6">
          입력 값을 바탕으로 실제에 가까운 로드맵을 제시합니다
        </p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">주담대 최대 한도</span>
            <span className="kakao-number">{formatCurrency(results.maxLoan)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">내 돈 부담액(다운페이)</span>
            <span className="kakao-number">{formatCurrency(results.downPayment)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">월 상환액</span>
            <span className="kakao-number">{formatCurrency(Math.round(results.monthlyPayment))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">현재 저축 속도</span>
            <span className="kakao-number">{formatCurrency(goalData.monthlySavings)}/월</span>
          </div>
                      <div className="flex justify-between items-center">
              <span className="text-gray-600">챌린지 추가 절약</span>
              <span className="kakao-number">{formatCurrency(totalAdditionalSavings)}/월</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">총 월 저축</span>
              <span className="kakao-number">{formatCurrency(goalData.monthlySavings + totalAdditionalSavings)}/월</span>
            </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">투자 수익률</span>
            <span className="kakao-number">{formatPercentage(0.0267)}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-12">
          <p className="text-blue-800 text-sm font-semibold">
            현재 전략으로 내 돈 부담액 달성까지 {achievementYears}년 0개월 예상
          </p>
          <p className="text-blue-700 text-xs mt-2">
            💡 연 수익률 {formatPercentage(0.0267)} + 월 저축 {formatCurrency(goalData.monthlySavings + totalAdditionalSavings)}로 모으면, 
            목표 자금({formatCurrency(results.downPayment, true)})에 도달하기까지 {achievementYears}년 소요
          </p>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="kakao-btn kakao-btn-secondary flex-1"
          >
            이전
          </button>
          <button
            onClick={() => setActiveTab('저축 챌린지')}
            className="kakao-btn kakao-btn-primary flex-1"
          >
            챌린지
          </button>
        </div>
      </div>

      <div className="kakao-card p-6 fade-in">
        <h3 className="text-lg font-bold mb-4">시나리오 가이드</h3>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            내 돈 부담액이 클수록 대출 월 상환액은 낮아집니다
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            챌린지로 월 저축액을 늘리면 내 돈 부담액 달성 시점이 단축됩니다
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            MMF/펀드 연동으로 복리 효과가 발생합니다
          </li>
        </ul>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-12">
          <p className="text-yellow-800 text-sm">
            ▲ 유의: 본 시뮬레이션은 참고용 가정이며, 실제 금리/한도/심사 결과와 다를 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );

  const renderChallengeStep = () => (
    <div className="space-y-6">
      <div className="kakao-card p-6 fade-in">
        <h2 className="text-xl font-bold mb-3">티끌 모아 태산</h2>
        <p className="text-sm text-gray-600 mb-6">
          작은 절약이 모여 내 집 마련 자금을 마련합니다
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center p-4 border border-gray-200 rounded-12 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={challenges.coffee}
              onChange={(e) => setChallenges({...challenges, coffee: e.target.checked})}
              className="mr-4"
            />
            <div className="flex-1">
              <div className="font-semibold">☕ 커피 5잔 줄이기</div>
              <div className="text-sm text-gray-600">4,000원 × 5잔 → +20,000원/월</div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-12 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={challenges.taxi}
              onChange={(e) => setChallenges({...challenges, taxi: e.target.checked})}
              className="mr-4"
            />
            <div className="flex-1">
              <div className="font-semibold">🚕 택시 2회 줄이기</div>
              <div className="text-sm text-gray-600">15,000원 × 2회 → +30,000원/월</div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-12 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={challenges.subscription}
              onChange={(e) => setChallenges({...challenges, subscription: e.target.checked})}
              className="mr-4"
            />
            <div className="flex-1">
              <div className="font-semibold">📺 구독 2개 정리</div>
              <div className="text-sm text-gray-600">10,000원 × 2개 → +20,000원/월</div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-12 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={challenges.dining}
              onChange={(e) => setChallenges({...challenges, dining: e.target.checked})}
              className="mr-4"
            />
            <div className="flex-1">
              <div className="font-semibold">🍜 외식 1회 줄이기</div>
              <div className="text-sm text-gray-600">25,000원 × 1회 → +25,000원/월</div>
            </div>
          </label>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-12">
          <span className="font-semibold text-gray-800">총 추가 절약액: {formatCurrency(totalAdditionalSavings)}/월</span>
        </div>

        <div className="mt-6 space-y-3">
          <button 
            onClick={() => alert('서비스 준비중입니다')}
            className="kakao-btn kakao-btn-primary w-full"
          >
            챌린지 기록통장 연결하기
          </button>
          <button 
            onClick={() => alert('서비스 준비중입니다')}
            className="kakao-btn kakao-btn-primary w-full"
          >
            자유적금 연결하기
          </button>
          <button 
            onClick={() => setActiveTab('맞춤 상품 추천')}
            className="kakao-btn kakao-btn-primary w-full"
          >
            투자상품 추천받기
          </button>
        </div>
      </div>

      <div className="kakao-card p-6 fade-in">
        <h2 className="text-xl font-bold mb-3">소셜 & 커뮤니티</h2>
        <p className="text-sm text-gray-600 mb-6">
          친구와 함께 챌린지를 진행하고, 진행률을 공유하세요
        </p>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-12">
            <h4 className="font-semibold mb-2">공동 챌린지 만들기</h4>
            <p className="text-sm text-gray-600 mb-4">친구와 함께 1,000만원 모으기</p>
            <button className="kakao-btn kakao-btn-primary w-full">
              초대 링크 생성
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-12">
            <h4 className="font-semibold mb-3">랭킹 보드</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">🥇 지**</span>
                <span className="text-sm font-semibold">진행률 58%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">🥈 김**</span>
                <span className="text-sm font-semibold">진행률 41%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">🥉 박**</span>
                <span className="text-sm font-semibold">진행률 33%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-12">
          <p className="text-green-800 text-sm font-semibold mb-1">현재 전략으로 내 돈 부담액 달성: {achievementYears}년 0개월</p>
          <p className="text-green-800 text-sm">총 월 저축 {formatCurrency(goalData.monthlySavings + totalAdditionalSavings)}, 추정 연수익률 {formatPercentage(0.0267)}</p>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="kakao-btn kakao-btn-secondary flex-1"
          >
            이전
          </button>
          <button className="kakao-btn kakao-btn-primary flex-1 bg-green-600 hover:bg-green-700">
            진행 상황 공유
          </button>
        </div>
      </div>
    </div>
  );

  const renderSocialStep = () => (
    <div className="space-y-6">
      <div className="kakao-card p-6 fade-in">
        <h3 className="text-lg font-bold mb-4">투자 연동</h3>
        <p className="text-sm text-gray-600 mb-4">
          단순 저축만 하는 대신, 투자 상품의 예상 수익률을 함께 반영해 목표 금액을 더 빨리 모을 수 있는 시나리오를 제공합니다
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center p-4 border border-gray-200 rounded-12 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="investment"
              value="mmf"
              checked={investment === 'mmf'}
              onChange={(e) => setInvestment(e.target.value)}
              className="mr-4"
            />
            <div className="flex-1">
              <div className="font-semibold flex items-center">
                MMF 박스
                <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">ℹ️</span>
              </div>
              <div className="text-sm text-gray-600">연 2.46%, 최대 5천만원까지 보관, 원하는 날 출금</div>
              <button className="kakao-btn kakao-btn-primary kakao-btn-small mt-2">
                수익계산하기 &gt;
              </button>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-12 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="investment"
              value="fund"
              checked={investment === 'fund'}
              onChange={(e) => setInvestment(e.target.value)}
              className="mr-4"
            />
            <div className="flex-1">
              <div className="font-semibold flex items-center">
                펀드 연동
                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">⚠️</span>
              </div>
              <div className="text-sm text-gray-600">천원으로 시작하는 쉬운 투자</div>
              <button className="kakao-btn kakao-btn-primary kakao-btn-small mt-2">
                나에게 맞는 펀드를 찾아보세요 [찾아보기]
              </button>
            </div>
          </label>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-12">
          <p className="text-blue-800 text-sm font-semibold mb-1">현재 전략으로 내 돈 부담액 달성까지 {achievementYears}년 0개월</p>
          <p className="text-blue-800 text-sm">연 수익률 가정: {formatPercentage(0.0267)}, 총 월 저축: {formatCurrency(goalData.monthlySavings + totalAdditionalSavings)}</p>
          <p className="text-blue-700 text-xs mt-2">
            💡 연 수익률 {formatPercentage(0.0267)} + 월 저축 {formatCurrency(goalData.monthlySavings + totalAdditionalSavings)}로 모으면, 
            목표 자금({formatCurrency(results.downPayment, true)})에 도달하기까지 {achievementYears}년 소요
          </p>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setCurrentStep(3)}
            className="kakao-btn kakao-btn-secondary flex-1"
          >
            이전
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className="kakao-btn kakao-btn-primary flex-1"
          >
            다음: 소셜
          </button>
        </div>
      </div>

      <div className="kakao-card p-6 fade-in">
        <h3 className="text-lg font-bold mb-4">상품 전환</h3>
        <div className="space-y-3">
          <button className="kakao-btn kakao-btn-secondary w-full">
            적금/자동이체 신청
          </button>
        </div>
      </div>


    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case '목표 설정':
        return renderGoalStep();
      case '자금 시뮬레이션':
        return renderSimulationStep();
      case '저축 챌린지':
        return renderChallengeStep();
      case '맞춤 상품 추천':
        return renderSocialStep();
      default:
        return renderGoalStep();
    }
  };

  return (
    <div className="min-h-screen">
      {/* 상단 헤더 */}
      <div className="top-header">
        <div className="user-name">이소연님</div>
        <div className="header-icons">
          <div className="header-icon">🔔</div>
          <div className="header-icon">⚙️</div>
        </div>
      </div>

      {/* 메인 탭 네비게이션 */}
      <div className="tab-navigation">
        <div className="flex justify-between">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`kakao-tab ${
                activeTab === tab ? 'kakao-tab-active' : 'kakao-tab-inactive'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>



      {/* 메인 콘텐츠 */}
      <div className="main-content">
        {renderContent()}
      </div>



      {/* 푸터 */}
      <div className="text-center py-6 text-xs text-gray-500 bg-white">
        © 프로토타입 · 카카오뱅크 서비스 기획 검증용. 모든 수치는 예시 가정치입니다
      </div>
    </div>
  );
}

export default App;