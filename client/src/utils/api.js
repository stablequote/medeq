// api.js (or any file where you manage API calls)
import axios from "axios";

// const BASE_URL = "http://localhost:5000/api/sales"; // Replace with your backend URL
const BASE_URL = import.meta.env.VITE_URL

export const fetchTotalSalesToday = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/sales/get-today-sales`);
    return response.data.totalSalesCount;
  } catch (error) {
    console.error("Error fetching total sales for today:", error);
    return 0;
  }
};

export const fetchTotalSalesThisWeek = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/sales/get-week-sales`);
    return response.data.totalSales;
  } catch (error) {
    console.error("Error fetching total sales for this week:", error);
    return 0;
  }
};

export const fetchTotalSalesThisMonth = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/sales/get-month-sales`);
    return response.data.totalSales;
  } catch (error) {
    console.error("Error fetching total sales for this month:", error);
    return 0;
  }
};

// fetching revenue
export const fetchTotalSalesRevenueToday = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/sales/total-sales-revenue-today`);
    return response.data.totalSalesRevenueToday;
  } catch (error) {
    console.error("Error fetching total sales revenue for today:", error);
    return 0;
  }
};


// export const fetchCashoutToday = async () => {
//   try {
//     const response = await axios.get(`${BASE_URL}/transfer/list`);
//     console.log(response)
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching total sales revenue for today:", error);
//     return 0;
//   }
// };
