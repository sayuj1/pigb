import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loanType: { type: String, enum: ["taken", "given"], required: true },
  borrowerName: {
    type: String,
    required: function () {
      return this.loanType === "taken";
    },
  },
  lenderName: {
    type: String,
    required: function () {
      return this.loanType === "given";
    },
  },
  loanCategory: { type: String, required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, default: 0 },
  tenureMonths: { type: Number, required: false }, // optional
  emiAmount: { type: Number, required: false },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  status: { type: String, default: "active" },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  remainingBalance: {
    type: Number,
    default: function () {
      return this.amount;
    },
  },
  createdAt: { type: Date, default: Date.now },
});

LoanSchema.methods.updateEMI = function () {
  let tenure = this.tenureMonths;

  if (!tenure && this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    tenure =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
  }

  if (tenure) {
    if (this.interestRate > 0) {
      const monthlyInterest = this.interestRate / 100 / 12;
      const remainingAmount = this.remainingBalance;
      const emi =
        (remainingAmount *
          monthlyInterest *
          Math.pow(1 + monthlyInterest, tenure)) /
        (Math.pow(1 + monthlyInterest, tenure) - 1);
      this.emiAmount = Math.round(emi);
    } else {
      // No-cost EMI: simply divide remaining balance over months
      this.emiAmount = Math.round(this.remainingBalance / tenure);
    }
  }
};

LoanSchema.pre("save", function (next) {
  this.remainingBalance =
    this.amount - this.payments.reduce((sum, p) => sum + p.amount, 0);

  if (this.remainingBalance <= 0) {
    this.remainingBalance = 0;
    this.status = "completed";
  } else if (this.endDate && new Date() > this.endDate) {
    this.status = "overdue";
  } else {
    this.status = "active";
  }

  // Always recalculate EMI
  this.updateEMI();
  next();
});

const Loan = mongoose.models.Loan || mongoose.model("Loan", LoanSchema);
export default Loan;
