// File: ReportPage.js (HOÀN CHÍNH SAU CHỊNH SỬaN)

import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Table,
  Statistic,
  Divider,
  Empty,
  Spin,
  Select,
} from "antd";
import {
  BarChartOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  GetRoomApi,
  GetUserApi,
  GetBuildingRevenueApi,
  GetDeviceApi,
  GetBookingsApi,
} from "../util/api";

const { Title } = Typography;
const { Option } = Select;

const ReportPage = () => {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allRevenueData, setAllRevenueData] = useState([]);

  const [yearlyRevenueData, setYearlyRevenueData] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [buildingRevenueData, setBuildingRevenueData] = useState([]);
  const [chartType, setChartType] = useState("year");
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomRes, userRes, revenueRes, deviceRes, bookingsRes] =
          await Promise.all([
            GetRoomApi(),
            GetUserApi(),
            GetBuildingRevenueApi(),
            GetDeviceApi(),
            GetBookingsApi(),
          ]);
        setRooms(roomRes);
        setUsers(userRes);
        setAllRevenueData(revenueRes);
        setDevices(deviceRes.data || []);
        setBookings(bookingsRes);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu báo cáo:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const flatRevenueData = Array.isArray(allRevenueData)
    ? allRevenueData.flatMap((b) =>
        (b.revenue || []).map((r) => ({
          buildingName: b.name,
          year: r.year,
          month: r.month,
          totalAmount: r.totalAmount,
        }))
      )
    : [];
  useEffect(() => {
    setSelectedMonth(null);
  }, [selectedYear]);    
  const uniqueYears = [...new Set(flatRevenueData.map((item) => item.year))];
  const uniqueMonths = [
    ...new Set(
      flatRevenueData
        .filter((item) => !selectedYear || item.year === selectedYear)
        .map((item) => item.month)
    ),
  ];
  const uniqueBuildings = [...new Set(flatRevenueData.map((item) => item.buildingName))];

  const filteredData = flatRevenueData.filter((item) => {
    return (
      (selectedYear ? item.year === selectedYear : true) &&
      (selectedMonth ? item.month === selectedMonth : true) &&
      (selectedBuilding ? item.buildingName === selectedBuilding : true)
    );
  });

  useEffect(() => {
    if (!Array.isArray(allRevenueData)) return;

    const yearlyTotals = {};
    const monthlyTotals = {};
    const buildingTotals = [];

    allRevenueData.forEach((building) => {
      let totalByBuilding = 0;
      if (Array.isArray(building.revenue)) {
        building.revenue.forEach((r) => {
          const label = `Th${r.month}/${r.year}`;
          yearlyTotals[r.year] = (yearlyTotals[r.year] || 0) + r.totalAmount;
          monthlyTotals[label] = (monthlyTotals[label] || 0) + r.totalAmount;
          totalByBuilding += r.totalAmount;
        });
      }
      buildingTotals.push({ name: building.name, revenue: totalByBuilding });
    });

    setYearlyRevenueData(
      Object.entries(yearlyTotals).map(([year, revenue]) => ({ year, revenue }))
    );

    setMonthlyRevenueData(
      Object.entries(monthlyTotals).map(([label, revenue]) => ({ label, revenue }))
    );

    setBuildingRevenueData(buildingTotals);
  }, [allRevenueData]);
  
  const columns = [
    {
      title: "Tòa nhà",
      dataIndex: "buildingName",
      key: "buildingName",
      sorter: (a, b) => a.buildingName.localeCompare(b.buildingName),
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
      sorter: (a, b) => a.year - b.year,
      align: "center",
    },
    {
      title: "Tháng",
      dataIndex: "month",
      key: "month",
      render: (month) => `Tháng ${month}`,
      sorter: (a, b) => a.month - b.month,
      align: "center",
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value) => value.toLocaleString("vi-VN") + " VNĐ",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      align: "right",
    },
  ];

  const renderChart = () => {
    let data, xKey;
    if (chartType === "year") {
      data = yearlyRevenueData;
      xKey = "year";
    } else if (chartType === "month") {
      data = monthlyRevenueData;
      xKey = "label";
    } else {
      data = buildingRevenueData;
      xKey = "name";
    }

    return data?.length ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data}
          margin={{ top: 30, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip
            formatter={(value) => value.toLocaleString("vi-VN") + " VNĐ"}
          />
          <Bar dataKey="revenue" fill="#1890ff">
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={(value) => value.toLocaleString("vi-VN")}
              offset={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <Empty description="Không có dữ liệu" />
    );
  };

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 24 }}>
        <Title level={2}>Báo cáo tổng hợp</Title>

        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic title="Tổng số phòng" value={rooms.length} prefix={<HomeOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Tổng số người dùng" value={users.length} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Tổng số thiết bị" value={devices.length} prefix={<BarChartOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Tổng số đơn đặt lịch" value={bookings.length} prefix={<DollarCircleOutlined />} />
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>Biểu đồ doanh thu</Title>
          </Col>
          <Col>
            <Select value={chartType} onChange={setChartType} style={{ width: 200 }}>
              <Option value="year">Theo năm</Option>
              <Option value="building">Theo tòa nhà</Option>
            </Select>
          </Col>
        </Row>

        {renderChart()}

{selectedYear && (
  <>
    <Divider />
    <Title level={4}>
      Biểu đồ doanh thu theo tháng trong năm {selectedYear}
    </Title>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={flatRevenueData
          .filter((item) => item.year === selectedYear)
          .reduce((acc, cur) => {
            const existing = acc.find((i) => i.month === cur.month);
            if (existing) {
              existing.revenue += cur.totalAmount;
            } else {
              acc.push({ month: cur.month, revenue: cur.totalAmount });
            }
            return acc;
          }, [])
          .sort((a, b) => a.month - b.month)}
          margin={{ top: 30, right: 30, left: 0, bottom: 5 }}
      >
        <XAxis dataKey="month" tickFormatter={(m) => `Tháng ${m}`} />
        <YAxis />
        <Tooltip formatter={(value) => value.toLocaleString("vi-VN") + " VNĐ"} />
        <Bar dataKey="revenue" fill="#52c41a">
          <LabelList
            dataKey="revenue"
            position="top"
            formatter={(value) => value.toLocaleString("vi-VN")}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </>
)}


        <Divider />

        <Title level={4}>Bảng doanh thu</Title>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="Chọn năm"
              allowClear
              style={{ width: 120 }}
              value={selectedYear}  
              onChange={setSelectedYear}
            >
              {uniqueYears.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Chọn tháng"
              allowClear
              style={{ width: 120 }}
              value={selectedMonth}
              onChange={setSelectedMonth}
            >
              {uniqueMonths.map((month) => (
                <Option key={month} value={month}>
                  Tháng {month}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Chọn tòa nhà"
              allowClear
              style={{ width: 200 }}
              value={selectedBuilding}
              onChange={setSelectedBuilding}
            >
              {uniqueBuildings.map((name) => (
                <Option key={name} value={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record, index) => `${record.buildingName}-${record.year}-${record.month}-${index}`}
        />
      </div>
    </Spin>
  );
};

export default ReportPage;