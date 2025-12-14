import { useEffect, useMemo, useState } from "react";
import { Container, Box, Grid, Card, Flex, Text, Paper, Center, Loader } from "@mantine/core";
import { IconMoneybag } from "@tabler/icons-react";
import axios from "axios";

const Ledger = () => {
    const [salesData, setSalesData] = useState([])
    const [expensesData, setExpensesData] = useState([])
    const [transfersData, setTransfersData] = useState([])
    const [loading, setLoading] = useState(false)

    const BASE_URL = import.meta.env.VITE_URL;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ salesRes, expensesRes, transfersRes ] = await Promise.all([
                axios.get(`${BASE_URL}/sales/list-sales`),
                axios.get(`${BASE_URL}/expenses/list`),
                axios.get(`${BASE_URL}/transfer/list`)
            ])
            console.log(expensesRes.data)
            console.log(salesRes.data.sales)
            console.log(transfersRes.data.data)
            setSalesData(salesRes.data.sales || [])
            setExpensesData(expensesRes.data || [] )
            setTransfersData(transfersRes.data.data || [])
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // helper function
    const isToday = (dateStr) => new Date(dateStr).toDateString() === new Date().toDateString();

    // filter data to match only today's record
    const todaySales = useMemo(() => salesData.filter(s => isToday(s.createdAt)), [salesData])
    const todayExpenses = useMemo(() => expensesData.filter(s => isToday(s.createdAt)), [expensesData])
    const todayTransfers = useMemo(() => transfersData.filter(s => isToday(s.createdAt)), [transfersData])

    // compute sales, expenses, and cashout within the day
    const totalSalesToday = todaySales.reduce((acc, sale) => acc + sale.totalPaidAmount, 0);

    const totalExpensesToday = todayExpenses.reduce((acc, exp) => {
        if(exp.paymentMethod === "Cash") {
            acc.cash += exp.amount || 0;
        } else if(exp.paymentMethod === "Bankak") {
            acc.bankak += exp.amount || 0;
        }
        acc.total += exp.amount || 0;
    }, { cash: 0, bankak: 0, total: 0 });

    const totalTransfersToday = todayTransfers.reduce((acc, transfer) => acc + transfer.amount, 0);

    const salesAmountBreakdown = todaySales.reduce((acc, sale) => {
        let cash;
        let bankak;

        if(sale.paymentMethod === "Cash") {
            acc.cash += sale.cashAmount || 0;
        } else if(sale.paymentMethod === "Bankak") {
            acc.bankak += sale.bankakAmount || 0;
        } else if(sale.paymentMethod === "Cash + Bankak") {
            acc.cash += sale.cashAmount || 0;
            acc.bankak+= sale.bankakAmount || 0;
        } else if(sale.paymentMethod === "Cashout") {
            acc.cash -= sale.cashAmount || 0;
            acc.bankak += sale.bankakAmount || 0;
        }
        acc.cash += cash;
        acc.bankak += bankak;
        acc.total += cash + bankak;
    }, { cash: 0, bankak: 0, total: 0 });

    // const currentBalance = (salesAmountBreakdown, totalExpensesToday, totalTransfersToday) => {
    // }
    let totalCashBalance;
    let totalBankakBalance;

    totalCashBalance = salesAmountBreakdown?.cash - totalExpensesToday?.cash || 0;
    totalBankakBalance = salesAmountBreakdown?.bankak  - totalExpensesToday || 0;
    totalCashBalance -= totalTransfersToday || 0; // current cash balance (after cashout)
    totalBankakBalance += totalTransfersToday || 0; // current bankak balance (after cashout)
    const grandTotal = totalCashBalance + totalBankakBalance || 0;
    console.log(totalExpensesToday)

    return (
       <Container size="90%">
        <Paper shadow="md" p="sm">
            {loading &&
                <Center>
                    <Loader size={32} color="green" variant="dots" />
                </Center>
            }
            <Grid>
                <Grid.Col span={4}><FinanceCard title="Total Current Balance" value={grandTotal} color="green" /></Grid.Col>
                <Grid.Col span={4}><FinanceCard title="Cash Balance" value={totalCashBalance} color="green" /></Grid.Col>
                <Grid.Col span={4}><FinanceCard title="Bankak Balance" value={totalBankakBalance} color="green" /></Grid.Col>
            </Grid>
            <Grid>
                {/* <Grid.Col span={3}><FinanceCard title="Cash Expenses Today" value={totalExpensesToday?.cash} color="red" /></Grid.Col>
                <Grid.Col span={3}><FinanceCard title="Bankak Expenses Today" value={totalExpensesToday?.bankak} color="red" /></Grid.Col>
                <Grid.Col span={3}><FinanceCard title="Total Expenses Today" value={totalExpensesToday?.total} color="red" /></Grid.Col>
                <Grid.Col span={3}><FinanceCard title="Cashout Today" value={totalTransfersToday} color="orange" /></Grid.Col> */}
            </Grid>
        </Paper>
       </Container>
    )
}

const FinanceCard = (title, value, color) => {
    return (
        <Card shadow="sm" padding="md" radius="md" withBorder>
            <Flex justify="space-between">
                <Box>
                    
                </Box>
                <Box>
                    <Text fw={600}>{"title"}</Text>
                    <Text fw={700} fz="xl" color={color}>{value} SDG</Text>
                </Box>
            </Flex>
        </Card>
    )
}

export default Ledger;