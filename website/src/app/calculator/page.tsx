'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as HomeIcon, Calculator as CalcIcon, ShieldCheck, RefreshCw,
  Receipt, TrendingUp, CalendarClock, Database, Phone,
} from 'lucide-react';
import AlfBanqMark from '@/components/AlfBanqMark';
import { PHONE, PHONE_TEL } from '@/lib/constants';

type TabId = 'home' | 'emi' | 'dbr' | 'balance' | 'transaction' | 'roi' | 'tenor' | 'ref';

const tabs: { id: TabId; label: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'emi', label: 'EMI', icon: CalcIcon },
  { id: 'dbr', label: 'DBR', icon: ShieldCheck },
  { id: 'balance', label: 'Balance', icon: RefreshCw },
  { id: 'transaction', label: 'Transaction', icon: Receipt },
  { id: 'roi', label: 'ROI', icon: TrendingUp },
  { id: 'tenor', label: 'Tenor', icon: CalendarClock },
  { id: 'ref', label: 'Ref Data', icon: Database },
];

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(192,192,192,0.18)',
  borderRadius: '6px',
};

const label: React.CSSProperties = {
  display: 'block', fontSize: '0.68rem', color: '#C0C0C0', letterSpacing: '0.15em',
  textTransform: 'uppercase', fontFamily: 'Josefin Sans, sans-serif', marginBottom: '6px',
};

function fmt(n: number) {
  if (!isFinite(n)) return '—';
  return n.toLocaleString('en-AE', { maximumFractionDigits: 0 });
}

function StatRow({ stat }: { stat: { l: string; v: string } }) {
  return (
    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(192,192,192,0.1)' }}>
      <span style={{ fontSize: '0.8rem', color: '#9BA5B4', fontFamily: 'Josefin Sans' }}>{stat.l}</span>
      <span className="gold-text font-bold" style={{ fontSize: '0.85rem', fontFamily: 'Cinzel, serif' }}>{stat.v}</span>
    </div>
  );
}

function emiAmortization(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = Math.max(1, Math.round(years * 12));
  const monthly = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const rows: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
  let balance = principal;
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const princ = monthly - interest;
    balance = Math.max(0, balance - princ);
    rows.push({ month: m, payment: monthly, principal: princ, interest, balance });
  }
  const totalInterest = rows.reduce((s, x) => s + x.interest, 0);
  return { monthly, rows, totalInterest, n };
}

/* ---------------- EMI TAB ---------------- */
function EmiTab() {
  const [propertyValue, setPropertyValue] = useState(2000000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [useMaxEligible, setUseMaxEligible] = useState(false);
  const [offPlan, setOffPlan] = useState(false);
  const [rateType, setRateType] = useState<'fixed' | 'variable'>('fixed');
  const [fixedRate, setFixedRate] = useState(3.99);
  const [variableRate, setVariableRate] = useState(4.49);
  const [fixedYears, setFixedYears] = useState(3);
  const [tenorYears, setTenorYears] = useState(25);
  const [insurancePct, setInsurancePct] = useState(0.4);
  const [includeDld, setIncludeDld] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleAll, setScheduleAll] = useState(false);

  const downPayment = (propertyValue * downPaymentPct) / 100;
  const maxEligibleLoan = propertyValue * (offPlan ? 0.5 : 0.8);
  const loanAmount = useMaxEligible ? maxEligibleLoan : Math.max(0, propertyValue - downPayment);

  const dldFee = propertyValue * 0.04;
  const agencyFee = propertyValue * 0.02;
  const registrationFee = 4000;
  const transactionCosts = includeDld ? dldFee + agencyFee + registrationFee : agencyFee + registrationFee;
  const insuranceCost = (loanAmount * insurancePct) / 100;

  const fixedPart = emiAmortization(loanAmount, rateType === 'fixed' ? fixedRate : variableRate, Math.min(fixedYears, tenorYears));
  const remainingYears = Math.max(0, tenorYears - fixedYears);
  const variablePart = remainingYears > 0
    ? emiAmortization(fixedPart.rows.length ? fixedPart.rows[fixedPart.rows.length - 1].balance : loanAmount, variableRate, remainingYears)
    : { monthly: 0, rows: [], totalInterest: 0, n: 0 };

  const fullTerm = emiAmortization(loanAmount, rateType === 'fixed' ? fixedRate : variableRate, tenorYears);

  const monthlyPayment = rateType === 'fixed' && fixedYears < tenorYears ? fixedPart.monthly : fullTerm.monthly;
  const totalInterest = rateType === 'fixed' && fixedYears < tenorYears
    ? fixedPart.totalInterest + variablePart.totalInterest
    : fullTerm.totalInterest;
  const totalPaid = loanAmount + totalInterest + insuranceCost;
  const grandTotal = totalPaid + transactionCosts + downPayment;

  const scheduleRows = scheduleAll ? fullTerm.rows : fullTerm.rows.slice(0, 12);

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Inputs */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div style={card} className="p-5">
          <h3 className="mb-4 font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Property Details</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label style={label}>Property Value (AED)</label>
              <input type="number" className="input-field" value={propertyValue}
                onChange={(e) => setPropertyValue(Number(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-3">
              <input id="offplan" type="checkbox" checked={offPlan} onChange={(e) => setOffPlan(e.target.checked)} />
              <label htmlFor="offplan" style={{ fontSize: '0.78rem', color: '#9BA5B4', fontFamily: 'Josefin Sans' }}>Off-Plan Property</label>
            </div>
            <div className="flex items-center gap-3">
              <input id="maxelig" type="checkbox" checked={useMaxEligible} onChange={(e) => setUseMaxEligible(e.target.checked)} />
              <label htmlFor="maxelig" style={{ fontSize: '0.78rem', color: '#9BA5B4', fontFamily: 'Josefin Sans' }}>Use Max Eligible Loan Amount</label>
            </div>
            {!useMaxEligible && (
              <div>
                <label style={label}>Down Payment %</label>
                <input type="number" className="input-field" value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(Number(e.target.value) || 0)} />
              </div>
            )}
          </div>
        </div>

        <div style={card} className="p-5">
          <h3 className="mb-4 font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Rate & Tenor</h3>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button onClick={() => setRateType('fixed')} className={rateType === 'fixed' ? 'btn-gold' : 'btn-outline'} style={{ flex: 1, padding: '10px', fontSize: '0.7rem', borderRadius: '4px' }}>Fixed</button>
              <button onClick={() => setRateType('variable')} className={rateType === 'variable' ? 'btn-gold' : 'btn-outline'} style={{ flex: 1, padding: '10px', fontSize: '0.7rem', borderRadius: '4px' }}>Variable</button>
            </div>
            {rateType === 'fixed' ? (
              <>
                <div>
                  <label style={label}>Fixed Rate %</label>
                  <input type="number" step="0.01" className="input-field" value={fixedRate}
                    onChange={(e) => setFixedRate(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={label}>Fixed Period (Years)</label>
                  <input type="number" className="input-field" value={fixedYears}
                    onChange={(e) => setFixedYears(Number(e.target.value) || 0)} />
                </div>
              </>
            ) : null}
            <div>
              <label style={label}>Variable Rate %</label>
              <input type="number" step="0.01" className="input-field" value={variableRate}
                onChange={(e) => setVariableRate(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label style={label}>Tenor (Years)</label>
              <input type="number" className="input-field" value={tenorYears}
                onChange={(e) => setTenorYears(Number(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        <div style={card} className="p-5">
          <h3 className="mb-4 font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Policy & Costs</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label style={label}>Life Insurance % (annual, on balance)</label>
              <input type="number" step="0.1" className="input-field" value={insurancePct}
                onChange={(e) => setInsurancePct(Number(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-3">
              <input id="dld" type="checkbox" checked={includeDld} onChange={(e) => setIncludeDld(e.target.checked)} />
              <label htmlFor="dld" style={{ fontSize: '0.78rem', color: '#9BA5B4', fontFamily: 'Josefin Sans' }}>Include DLD Transfer Fee (4%)</label>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        <div style={card} className="p-6 text-center">
          <p className="section-label mb-2">Estimated Monthly Payment</p>
          <div className="gold-shimmer font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Cinzel, serif' }}>
            AED {fmt(monthlyPayment)}
          </div>
          <p style={{ color: '#7A8699', fontSize: '0.75rem', fontFamily: 'Josefin Sans', marginTop: '6px' }}>
            per month over {tenorYears} years
          </p>
        </div>

        <div style={card} className="p-5">
          <h3 className="mb-2 font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Loan Summary</h3>
          <StatRow stat={{ l: 'Property Value', v: `AED ${fmt(propertyValue)}` }} />
          <StatRow stat={{ l: 'Down Payment', v: `AED ${fmt(downPayment)}` }} />
          <StatRow stat={{ l: 'Loan Amount', v: `AED ${fmt(loanAmount)}` }} />
          <StatRow stat={{ l: 'Max Eligible (LTV)', v: `AED ${fmt(maxEligibleLoan)}` }} />
          <StatRow stat={{ l: 'Total Interest', v: `AED ${fmt(totalInterest)}` }} />
          <StatRow stat={{ l: 'Total of Payments', v: `AED ${fmt(totalPaid)}` }} />
        </div>

        <div style={card} className="p-5">
          <h3 className="mb-2 font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Total Cost Breakdown</h3>
          <StatRow stat={{ l: 'Principal', v: `AED ${fmt(loanAmount)}` }} />
          <StatRow stat={{ l: `Interest (${rateType === 'fixed' ? 'Fixed → Variable' : 'Variable'})`, v: `AED ${fmt(totalInterest)}` }} />
          <StatRow stat={{ l: 'Life Insurance', v: `AED ${fmt(insuranceCost)}` }} />
          <StatRow stat={{ l: 'DLD + Agency + Registration', v: `AED ${fmt(transactionCosts)}` }} />
          <div className="flex justify-between pt-3">
            <span style={{ fontSize: '0.85rem', color: '#F5F0E8', fontFamily: 'Cinzel, serif' }}>Grand Total</span>
            <span className="gold-text font-bold" style={{ fontSize: '0.95rem', fontFamily: 'Cinzel, serif' }}>AED {fmt(grandTotal)}</span>
          </div>
        </div>

        {/* Visual analytics - simple bar split */}
        <div style={card} className="p-5">
          <h3 className="mb-3 font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Payment Breakdown / Visual Analytics</h3>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            <div style={{ width: `${(loanAmount / grandTotal) * 100}%`, background: '#C0C0C0' }} />
            <div style={{ width: `${(totalInterest / grandTotal) * 100}%`, background: '#8A8A8A' }} />
            <div style={{ width: `${(insuranceCost / grandTotal) * 100}%`, background: '#5A6275' }} />
            <div style={{ width: `${(transactionCosts / grandTotal) * 100}%`, background: '#3A4255' }} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { c: '#C0C0C0', l: 'Principal' }, { c: '#8A8A8A', l: 'Interest' },
              { c: '#5A6275', l: 'Insurance' }, { c: '#3A4255', l: 'Fees' },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-2">
                <span style={{ width: 10, height: 10, background: x.c, borderRadius: 2 }} />
                <span style={{ fontSize: '0.72rem', color: '#9BA5B4', fontFamily: 'Josefin Sans' }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amortization schedule */}
        <div style={card} className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Amortization Schedule</h3>
            <button onClick={() => setShowSchedule((s) => !s)} className="btn-outline px-4 py-2 text-xs rounded-sm">
              {showSchedule ? 'Hide' : 'Show'}
            </button>
          </div>
          {showSchedule && (
            <>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left" style={{ fontSize: '0.72rem', fontFamily: 'Josefin Sans', color: '#9BA5B4' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(192,192,192,0.2)' }}>
                      <th className="py-2 pr-3">Month</th><th className="py-2 pr-3">Payment</th>
                      <th className="py-2 pr-3">Principal</th><th className="py-2 pr-3">Interest</th><th className="py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleRows.map((row) => (
                      <tr key={row.month} style={{ borderBottom: '1px solid rgba(192,192,192,0.06)' }}>
                        <td className="py-1.5 pr-3">{row.month}</td>
                        <td className="py-1.5 pr-3">{fmt(row.payment)}</td>
                        <td className="py-1.5 pr-3">{fmt(row.principal)}</td>
                        <td className="py-1.5 pr-3">{fmt(row.interest)}</td>
                        <td className="py-1.5">{fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!scheduleAll && fullTerm.rows.length > 12 && (
                <button onClick={() => setScheduleAll(true)} className="mt-3 text-xs" style={{ color: '#C0C0C0', fontFamily: 'Josefin Sans' }}>
                  Show full {fullTerm.n}-month schedule →
                </button>
              )}
            </>
          )}
        </div>

        {/* Smart tips */}
        <div style={card} className="p-5">
          <h3 className="mb-2 font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Smart Tips</h3>
          <ul className="flex flex-col gap-2" style={{ fontSize: '0.78rem', color: '#9BA5B4', fontFamily: 'Josefin Sans', lineHeight: 1.6 }}>
            <li>• Increasing your down payment by 5% can lower your monthly payment significantly.</li>
            <li>• Locking a fixed rate protects you from EIBOR fluctuations during the fixed period.</li>
            <li>• A shorter tenor increases monthly payments but reduces total interest paid.</li>
            <li>• Compare 18+ bank lenders with ALF BANQ before committing to a single offer.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------------- DBR TAB ---------------- */
function DbrTab() {
  const [income, setIncome] = useState(40000);
  const [liabilities, setLiabilities] = useState(3000);
  const [proposedEmi, setProposedEmi] = useState(8000);

  const dbr = income > 0 ? ((liabilities + proposedEmi) / income) * 100 : 0;
  const cap = 50;
  const within = dbr <= cap;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div style={card} className="p-5 flex flex-col gap-4">
        <h3 className="font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Debt Burden Ratio Calculator</h3>
        <div>
          <label style={label}>Monthly Gross Income (AED)</label>
          <input type="number" className="input-field" value={income} onChange={(e) => setIncome(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>Existing Monthly Liabilities (AED)</label>
          <input type="number" className="input-field" value={liabilities} onChange={(e) => setLiabilities(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>Proposed Mortgage EMI (AED)</label>
          <input type="number" className="input-field" value={proposedEmi} onChange={(e) => setProposedEmi(Number(e.target.value) || 0)} />
        </div>
      </div>
      <div style={card} className="p-6 text-center flex flex-col items-center justify-center gap-3">
        <p className="section-label">DBR Policy Check (UAE Central Bank cap: 50%)</p>
        <div className="gold-shimmer font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Cinzel, serif' }}>
          {dbr.toFixed(1)}%
        </div>
        <p style={{ color: within ? '#C0C0C0' : '#E07A7A', fontFamily: 'Josefin Sans', fontSize: '0.85rem' }}>
          {within ? 'Within DBR policy limit' : 'Exceeds DBR policy limit — restructuring recommended'}
        </p>
      </div>
    </div>
  );
}

/* ---------------- BALANCE TRANSFER TAB ---------------- */
function BalanceTab() {
  const [balance, setBalance] = useState(1500000);
  const [currentRate, setCurrentRate] = useState(4.99);
  const [newRate, setNewRate] = useState(3.79);
  const [remainingYears, setRemainingYears] = useState(20);

  const current = emiAmortization(balance, currentRate, remainingYears);
  const next = emiAmortization(balance, newRate, remainingYears);
  const monthlySavings = current.monthly - next.monthly;
  const lifetimeSavings = current.totalInterest - next.totalInterest;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div style={card} className="p-5 flex flex-col gap-4">
        <h3 className="font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Balance Transfer & Buyout Calculator</h3>
        <div>
          <label style={label}>Outstanding Balance (AED)</label>
          <input type="number" className="input-field" value={balance} onChange={(e) => setBalance(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>Current Rate %</label>
          <input type="number" step="0.01" className="input-field" value={currentRate} onChange={(e) => setCurrentRate(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>New Rate %</label>
          <input type="number" step="0.01" className="input-field" value={newRate} onChange={(e) => setNewRate(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>Remaining Tenor (Years)</label>
          <input type="number" className="input-field" value={remainingYears} onChange={(e) => setRemainingYears(Number(e.target.value) || 0)} />
        </div>
      </div>
      <div style={card} className="p-5">
        <StatRow stat={{ l: 'Current Monthly Payment', v: `AED ${fmt(current.monthly)}` }} />
        <StatRow stat={{ l: 'New Monthly Payment', v: `AED ${fmt(next.monthly)}` }} />
        <StatRow stat={{ l: 'Monthly Savings', v: `AED ${fmt(monthlySavings)}` }} />
        <StatRow stat={{ l: 'Lifetime Interest Savings', v: `AED ${fmt(lifetimeSavings)}` }} />
      </div>
    </div>
  );
}

/* ---------------- TRANSACTION COST TAB ---------------- */
function TransactionTab() {
  const [propertyValue, setPropertyValue] = useState(2000000);
  const dld = propertyValue * 0.04;
  const dldAdmin = 580;
  const agency = propertyValue * 0.02;
  const trustee = 4000;
  const mortgageReg = propertyValue * 0.0025 + 290;
  const valuation = 3000;
  const total = dld + dldAdmin + agency + trustee + mortgageReg + valuation;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div style={card} className="p-5 flex flex-col gap-4">
        <h3 className="font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Transaction Cost Calculator</h3>
        <div>
          <label style={label}>Property Value (AED)</label>
          <input type="number" className="input-field" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value) || 0)} />
        </div>
      </div>
      <div style={card} className="p-5">
        <StatRow stat={{ l: 'DLD Transfer Fee (4%)', v: `AED ${fmt(dld)}` }} />
        <StatRow stat={{ l: 'DLD Admin Fee', v: `AED ${fmt(dldAdmin)}` }} />
        <StatRow stat={{ l: 'Agency Fee (2%)', v: `AED ${fmt(agency)}` }} />
        <StatRow stat={{ l: 'Trustee Fee', v: `AED ${fmt(trustee)}` }} />
        <StatRow stat={{ l: 'Mortgage Registration', v: `AED ${fmt(mortgageReg)}` }} />
        <StatRow stat={{ l: 'Valuation Fee', v: `AED ${fmt(valuation)}` }} />
        <div className="flex justify-between pt-3">
          <span style={{ fontSize: '0.85rem', color: '#F5F0E8', fontFamily: 'Cinzel, serif' }}>Total Transaction Cost</span>
          <span className="gold-text font-bold" style={{ fontSize: '0.95rem', fontFamily: 'Cinzel, serif' }}>AED {fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ROI TAB ---------------- */
function RoiTab() {
  const [price, setPrice] = useState(2000000);
  const [annualRent, setAnnualRent] = useState(140000);
  const [annualExpenses, setAnnualExpenses] = useState(20000);

  const netIncome = annualRent - annualExpenses;
  const roi = price > 0 ? (netIncome / price) * 100 : 0;
  const grossYield = price > 0 ? (annualRent / price) * 100 : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div style={card} className="p-5 flex flex-col gap-4">
        <h3 className="font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Investment ROI Calculator</h3>
        <div>
          <label style={label}>Property Price (AED)</label>
          <input type="number" className="input-field" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>Annual Rental Income (AED)</label>
          <input type="number" className="input-field" value={annualRent} onChange={(e) => setAnnualRent(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>Annual Expenses / Service Charges (AED)</label>
          <input type="number" className="input-field" value={annualExpenses} onChange={(e) => setAnnualExpenses(Number(e.target.value) || 0)} />
        </div>
      </div>
      <div style={card} className="p-5">
        <StatRow stat={{ l: 'Gross Rental Yield', v: `${grossYield.toFixed(2)}%` }} />
        <StatRow stat={{ l: 'Net Annual Income', v: `AED ${fmt(netIncome)}` }} />
        <StatRow stat={{ l: 'Net ROI', v: `${roi.toFixed(2)}%` }} />
      </div>
    </div>
  );
}

/* ---------------- TENOR TAB ---------------- */
function TenorTab() {
  const [loanAmount, setLoanAmount] = useState(1500000);
  const [rate, setRate] = useState(3.99);
  const [affordableEmi, setAffordableEmi] = useState(8000);

  const r = rate / 100 / 12;
  const n = useMemo(() => {
    if (affordableEmi <= loanAmount * r) return Infinity;
    return Math.log(affordableEmi / (affordableEmi - loanAmount * r)) / Math.log(1 + r);
  }, [loanAmount, r, affordableEmi]);
  const years = n / 12;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div style={card} className="p-5 flex flex-col gap-4">
        <h3 className="font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Required Tenor Calculator</h3>
        <div>
          <label style={label}>Loan Amount (AED)</label>
          <input type="number" className="input-field" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>Interest Rate %</label>
          <input type="number" step="0.01" className="input-field" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label style={label}>Affordable Monthly Payment (AED)</label>
          <input type="number" className="input-field" value={affordableEmi} onChange={(e) => setAffordableEmi(Number(e.target.value) || 0)} />
        </div>
      </div>
      <div style={card} className="p-6 text-center flex flex-col items-center justify-center gap-2">
        <p className="section-label">Required Tenor</p>
        <div className="gold-shimmer font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Cinzel, serif' }}>
          {isFinite(years) ? `${years.toFixed(1)} yrs` : 'N/A'}
        </div>
        <p style={{ color: '#7A8699', fontFamily: 'Josefin Sans', fontSize: '0.78rem' }}>
          {isFinite(years) ? 'Maximum UAE tenor cap is typically 25 years.' : 'Increase affordable payment — current amount only covers interest.'}
        </p>
      </div>
    </div>
  );
}

/* ---------------- REF DATA TAB ---------------- */
const refRates = [
  { bank: 'Emirates NBD', fixed: '3.75%', variable: '0.55% + EIBOR' },
  { bank: 'ADIB', fixed: '3.79%', variable: '0.60% + EIBOR' },
  { bank: 'Dubai Islamic Bank', fixed: '3.85%', variable: '0.65% + EIBOR' },
  { bank: 'Mashreq', fixed: '3.95%', variable: '0.70% + EIBOR' },
  { bank: 'HSBC', fixed: '4.19%', variable: '0.75% + EIBOR' },
];

function RefDataTab() {
  return (
    <div style={card} className="p-5 overflow-x-auto">
      <h3 className="mb-4 font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.95rem' }}>Reference Bank Rate Data</h3>
      <table className="w-full text-left" style={{ fontSize: '0.8rem', fontFamily: 'Josefin Sans', color: '#9BA5B4' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(192,192,192,0.2)' }}>
            <th className="py-2 pr-3">Bank</th><th className="py-2 pr-3">Fixed Rate</th><th className="py-2">Variable Rate</th>
          </tr>
        </thead>
        <tbody>
          {refRates.map((r) => (
            <tr key={r.bank} style={{ borderBottom: '1px solid rgba(192,192,192,0.06)' }}>
              <td className="py-2 pr-3" style={{ color: '#C8C0B0' }}>{r.bank}</td>
              <td className="py-2 pr-3">{r.fixed}</td>
              <td className="py-2">{r.variable}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: '0.68rem', color: '#4A5568', marginTop: '14px', fontFamily: 'Josefin Sans' }}>
        Indicative rates from our network of 18+ bank lenders. Contact ALF BANQ for current live offers.
      </p>
    </div>
  );
}

/* ---------------- HOME TAB ---------------- */
function HomeTab({ go }: { go: (t: TabId) => void }) {
  const items: { id: TabId; label: string; icon: typeof HomeIcon; desc: string }[] = [
    { id: 'emi', label: 'EMI Calculator', icon: CalcIcon, desc: 'Full monthly payment, loan summary & amortization schedule.' },
    { id: 'dbr', label: 'DBR Calculator', icon: ShieldCheck, desc: 'Check your Debt Burden Ratio against UAE policy caps.' },
    { id: 'balance', label: 'Balance Transfer', icon: RefreshCw, desc: 'Compare savings from switching/buyout to a better rate.' },
    { id: 'transaction', label: 'Transaction Costs', icon: Receipt, desc: 'DLD, agency, trustee & registration fee breakdown.' },
    { id: 'roi', label: 'ROI Calculator', icon: TrendingUp, desc: 'Estimate rental yield and return on investment.' },
    { id: 'tenor', label: 'Tenor Calculator', icon: CalendarClock, desc: 'Find the tenor needed to fit your affordable payment.' },
    { id: 'ref', label: 'Reference Data', icon: Database, desc: 'Indicative live rates across our bank network.' },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(({ id, label: l, icon: Icon, desc }) => (
        <button key={id} onClick={() => go(id)} style={card} className="p-5 text-left service-card">
          <div className="mb-3 w-10 h-10 flex items-center justify-center rounded-sm" style={{ background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.2)' }}>
            <Icon size={18} style={{ color: '#C0C0C0' }} />
          </div>
          <h3 className="mb-1 font-semibold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '0.85rem' }}>{l}</h3>
          <p style={{ fontSize: '0.75rem', color: '#7A8699', fontFamily: 'Josefin Sans', lineHeight: 1.6 }}>{desc}</p>
        </button>
      ))}
    </div>
  );
}

export default function CalculatorPage() {
  const [active, setActive] = useState<TabId>('home');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #050C1E 0%, #0D1B3E 45%, #080F22 100%)' }}>
      <header className="border-b" style={{ borderColor: 'rgba(192,192,192,0.15)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlfBanqMark size={36} />
            <div>
              <div className="font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#F5F0E8', fontSize: '1.05rem', letterSpacing: '0.1em' }}>ALF BANQ</div>
              <div style={{ fontSize: '0.6rem', color: '#C0C0C0', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Mortgage Calculator</div>
            </div>
          </div>
          <a href={PHONE_TEL} className="flex items-center gap-2 text-xs" style={{ color: '#C0C0C0' }}>
            <Phone size={14} /> {PHONE}
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(({ id, label: l, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={active === id ? 'btn-gold' : 'btn-outline'}
              style={{ padding: '10px 16px', fontSize: '0.7rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {active === 'home' && <HomeTab go={setActive} />}
            {active === 'emi' && <EmiTab />}
            {active === 'dbr' && <DbrTab />}
            {active === 'balance' && <BalanceTab />}
            {active === 'transaction' && <TransactionTab />}
            {active === 'roi' && <RoiTab />}
            {active === 'tenor' && <TenorTab />}
            {active === 'ref' && <RefDataTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
