import { Text, Container, Flex, Box, Button, Anchor, Grid,  } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Sales from './Sales';
import DashboardCard from '../components/DashboardCard';
import {
  fetchTotalSalesToday,
  fetchTotalSalesThisWeek,
  fetchTotalSalesThisMonth,
  fetchTotalSalesRevenueToday,
  // fetchCashoutToday,
} from "../utils/api";
import { useTranslation } from 'react-i18next';

const Home = () => {
  // const [sales, setSales] = useState({ today: 0, thisWeek: 0, thisMonth: 0 });
  const [totalSalesToday, setTotalSalesToday] = useState(0);
  const [totalSalesThisWeek, setTotalSalesThisWeek] = useState(0);
  const [totalSalesThisMonth, setTotalSalesThisMonth] = useState(0);
  // const [cashoutToday, setCashoutToday] = useState(0);
  
  const [totalSalesRevenueToday, setTotalSalesRevenueToday] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const today = await fetchTotalSalesToday();
      const week = await fetchTotalSalesThisWeek();
      const month = await fetchTotalSalesThisMonth();
      // const cashout = await fetchCashoutToday();
      
      const todayRevenue = await fetchTotalSalesRevenueToday()

      setTotalSalesToday(today);
      setTotalSalesThisWeek(week);
      setTotalSalesThisMonth(month);
      // setCashoutToday(cashout)

      setTotalSalesRevenueToday(todayRevenue);
    };

    fetchData();
  }, []);

  const { t } = useTranslation();


  return (
    <Container size="xl">
      <Text fw="bold" fz="xl" mb="md">{t("Quick-Overview")}</Text>
        <Grid justify="space-between"  >
          <Grid.Col span={3} >
            <DashboardCard mr="md" text={t("Total-Customers")} number={134} />
          </Grid.Col>
          <Grid.Col span={3}>
            <DashboardCard mr="md" text={t("Today's-net-revenue")} number={totalSalesRevenueToday} />
          </Grid.Col>
          <Grid.Col span={3}>
            <DashboardCard mr="md" text={t("Total-Sales-Today")} number={totalSalesToday} />
          </Grid.Col>
          <Grid.Col span={3}>
            <DashboardCard mr="md" text={t("Out-of-stock")} number={12} />
          </Grid.Col>
        </Grid>
        {/* <Grid mt="md" justify="space-between"  >
          <Grid.Col span={4}>
            <DashboardCard mr="md" text={t("Cashout Today")} number={cashoutToday} />
          </Grid.Col>
        </Grid> */}
    </Container>
  );
};

export default Home;