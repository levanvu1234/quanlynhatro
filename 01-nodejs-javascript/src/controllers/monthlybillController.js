const monthlyBillService = require('../services/monthlybillService');

const monthlyBillController = {
  create: async (req, res) => {
    try {
      const bill = await monthlyBillService.create(req.body);
      res.status(201).json(bill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const bill = await monthlyBillService.update(req.params.id, req.body);
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
      res.json(bill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // delete: async (req, res) => {
  //   try {
  //     const result = await monthlyBillService.delete(req.params.id);
  //     if (!result) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
  //     res.json({ message: 'Xóa thành công' });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // },

  getById: async (req, res) => {
    try {
      const bill = await monthlyBillService.getById(req.params.id);
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
      res.json(bill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const { roomId, month, year } = req.query;
      const filter = {};
      if (roomId) filter.room = roomId;
      if (month) filter.month = parseInt(month);
      if (year) filter.year = parseInt(year);

      const bills = await monthlyBillService.getAll(filter);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSummaryByMonthYear: async (req, res) => {
    try {
      const { month, year } = req.query;
      if (!month || !year)
        return res.status(400).json({ message: 'Thiếu month hoặc year' });

      const result = await monthlyBillService.getSummaryByMonthYear(
        parseInt(month),
        parseInt(year)
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
 


};

module.exports = monthlyBillController;
