import React, { useEffect, useState, useMemo } from 'react';
import { Box, Button, Title, Group, ActionIcon, TextInput, Modal, Text, Flex, NumberInput, Container, Select, Tooltip } from '@mantine/core';
import moment from 'moment'
import DataGrid from '../components/DataGrid';
import axios from 'axios';
import { IconArrowBack, IconDownload, IconEdit, IconReport, IconTransfer, IconTrash } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';
import html2pdf from "html2pdf.js"
import CustomTable from '../components/CustomTable';
import { generateCsv, mkConfig, download } from 'export-to-csv';

const ProductSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [returnRow, setReturnRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [cashModal, setCashModal] = useState(false)
  const [todaysTransfers, setTodayTransfers] = useState([])
  const [salesTotals, setSalesTotals] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [filteredSales, setFilteredSales] = useState([]);
  const [value, setValue] = useState(null); // date range
  const [shift, setShift] = useState('morning');
  const [filtered, setFiltered] = useState([]);

  // copied from ahs ==> states for table management
  const [tableData, setTableData] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [checkedRow, setCheckedRow] = useState([]);
  const [data, setData] = useState([]);
  
  const BASE_URL = import.meta.env.VITE_URL;
  const { t } = useTranslation();
  const salesColumns = useMemo(
    () => [
      {
        accessorFn: (data) =>
          data.items.map((itm) => itm.product || itm.name).join(", "),
        id: "product",
        header: t("Product"),
        size: 120,
      },
      {
        accessorFn: (data) => data.items.map((itm) => itm.quantity).join(", "),
        id: "quantity",
        header: t("Quantity"),
        size: 120,
      },
      {
        accessorFn: (data) => data.items.map((itm) => itm.unit).join(", "),
        id: "unit",
        header: t("Unit"),
        size: 120,
      },
      {
        accessorFn: (data) =>
          data.items.map((itm) => itm.unitPurchasePrice).join(", "),
        id: "unitPurchasePrice",
        header: t("Purchase-Price"),
        size: 100,
      },
      {
        accessorFn: (data) =>
          data.items.map((itm) => itm.unitSalePrice).join(", "),
        id: "unitSalePrice",
        header: t("Sale-Price"),
        size: 100,
      },
      {
        accessorKey: "totalCartAmount",
        header: t("Total-Amount"),
        size: 100,
      },
      {
        accessorKey: "totalPaidAmount",
        header: t("Total-Paid-Amount"),
        size: 100,
      },
      { accessorKey: "modeOfPayment", header: t("Payment-Method"), size: 30 },
      { accessorKey: "cashAmount", header: t("Cash Amount"), size: 30 },
      { accessorKey: "bankakAmount", header: t("Bankak Amount"), size: 30 },
      // { accessorKey: "modeOfPayment === 'Bankak' ? totalPaidAmount || totalCartAmount : bankakAmount", header: t("Bankak Amount"), size: 30 },
      { accessorKey: "soldBy", header: t("Sold-By"), size: 30 },
      { accessorKey: "receiptNumber", header: t("Receipt-Number"), size: 120 },
      {
        accessorFn: (data) => moment(data.createdAt).format("DD-MM-YYYY h:mm a"),
        id: "createdAt",
        header: t("Date"),
        size: 120,
      },
    ],
    [t]
  );

  const fetchInventoryData = async (url) => {
    try {
      const res = await axios.get(url);
      console.log(res);
      setSalesData(res.data.sales);
      console.log(res.data.sales)
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setSalesData([]); // Set to empty array in case of error
    }
  };

  // useEffect(() => {
  //   const url = `${BASE_URL}/sales/list-sales`;
  //   const todaysTransfersReq = axios.get(`${BASE_URL}/transfer/list-today`)
  //   const res = axios.get(url);

  //   const totalTransferAmount = todaysTransfersReq.data?.reduce((sum, t) => sum + t.amount, 0);

  //   console.log(res)
  //   console.log(todaysTransfersReq)
  //   console.log(totalTransferAmount)

  //   fetchInventoryData(url)
  //   setTodayTransfers(todaysTransfersReq)
  // }, [])

//   useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const url = `${BASE_URL}/sales/list-sales`;
//       const [salesRes, transferRes] = await Promise.all([
//         axios.get(url),
//         axios.get(`${BASE_URL}/transfer/list-today`)
//       ]);

//       const transfers = transferRes.data?.data || []; // Use `data.data` based on your response structure
//       const totalTransferAmount = transfers.reduce((sum, t) => sum + t.amount, 0);

//       console.log("Total Transfer:", totalTransferAmount);
//       console.log("Sales:", salesRes.data);
//       console.log("Transfers:", transfers);

//       // You can now calculate netCash / netBank using your logic
//       // const netCash = totalCashSales - totalTransferAmount;
//       // const netBank = totalBankSales + totalTransferAmount;

//     } catch (error) {
//       console.error("Error fetching sales or transfers:", error);
//     }
//   };

//   fetchData();
// }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allSales = await axios.get(`${BASE_URL}/sales/list-sales`);
        const allTransferToday = await axios.get(`${BASE_URL}/transfer/list-today`);

        const salesList = allSales.data.sales || [];
        const transferList = allTransferToday.data.data || [];

        setSalesData(salesList);
        setTodayTransfers(transferList);

        const isToday = (dateString) => {
          const date = new Date(dateString);
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          return date >= start && date <= end;
        };

        const todaySales = salesList.filter(sale => isToday(sale.createdAt));
        console.log("Today Sales: ", todaySales)

        const totals = todaySales.reduce(
          (acc, sale) => {
            const cash = sale.cashAmount || 0;
            const bank = sale.bankakAmount || 0;
            const paymentMethod = sale.modeOfPayment

            if(paymentMethod === 'Cash') {
              acc.cash += cash;
              acc.total += cash
            } else if(paymentMethod === 'Bankak') {
              acc.bank += bank;
              acc.total += bank;
            } else if(paymentMethod === 'Fawry') {
              acc.bank += bank;
              acc.total += bank;
            } else if(paymentMethod === 'Cash + Bankak') {
              acc.cash += cash;
              acc.bank += bank;
              acc.total += cash + bank;
            } else {
              // cashout handling ===> 15,000 => 10,000
              acc.bank += bank;
            }
            return acc;
          },
          { cash: 0, bank: 0, total: 0 }
        );
        console.log("total after reducing", totals)

      // for (const transfer of transferList) {
      //   const from = transfer.from || "Cash";
      //   const to = transfer.to || "Bankak";
      //   const amount = transfer.amount || 0;

      //   totals[from] = (totals[from] || 0) - amount;
      //   totals[to] = (totals[to] || 0) + amount;
      // }

      // const overallTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);
      console.log("Overall Total: ", overallTotal)

      setSalesTotals(totals);
      // setOverallTotal(totals);

    } catch (error) {
      console.error("Error fetching sales or transfers:", error);
    }
    };
  fetchData()
  }, []);

  // Filter sales by date range
  useEffect(() => {
    if (!value || value.length !== 2) {
      setFilteredSales(salesData);
      return;
    }
    const [start, end] = value;
    const filtered = salesData.filter((sale) => {
      const created = new Date(sale.createdAt);
      return created >= start && created <= end;
    });
    setFilteredSales(filtered);
  }, [value, salesData]);

  // Edit Modal Handlers
  const handleEdit = (row) => {
    console.log(row)
    setEditRow(row);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    setData((prev) =>
      prev.map((item) => (item.id === editRow.id ? editRow : item))
    );
    setEditModalOpen(false);
  };

  // Delete Modal Handlers
  const handleDelete = (row) => {
    setDeleteRow(row);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoader(true);
    try {
      console.log("Deleted Row: ", deleteRow)
      const url = `${BASE_URL}/sales/delete/${deleteRow?.original._id}`;
      const res = await axios.delete(url);
      // console.log(res);
  
      if (res.status === 200) {
        showNotification({
          title: "Success",
          message: "You have successfully returned item to inventory",
          color: "green"
        });
        // setSalesData(res.data.sales);
      } else {
        showNotification({
          title: "Error",
          message: "An error occurred while returning item to inventory",
          color: "red"
        });
      }
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.message || "Something went wrong",
        color: "red",
      });
    } finally {
      setLoader(false);
      // setData((prev) => prev.filter((item) => item.id !== deleteRow?.original.id));
      // setDeleteModalOpen(false);
    }
  };

  // return product functionality
  const handleReturn = (row) => {
    setReturnRow(row)
    setReturnModalOpen(true)
  }

  const confirmReturn = async () => {
    setLoader(true);
    try {
      console.log("Retured Row: ", returnRow)
      const url = `${BASE_URL}/inventory/return`;
      const res = await axios.put(url, returnRow);
      // console.log(res);
  
      if (res.status === 200) {
        showNotification({
          title: "Success",
          message: "You have successfully returned item to inventory",
          color: "green"
        });
        setSalesData(res.data.sales);
        setReturnModalOpen(false);
      } else {
        showNotification({
          title: "Error",
          message: "An error occurred while returning item to inventory",
          color: "red"
        });
      }
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.message || "Something went wrong",
        color: "red",
      });
    } finally {
      setLoader(false);
    }
  };

  // const totals = sales.reduce((acc, sale) => {
  //   const method = salesData.paymentMethod;
  //   if (!acc[method]) acc[method] = 0;
  //   acc[method] += sale.total;
  //   return acc;
  // }, {});

  // const isToday = (dateString) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  //   const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  //   return date >= start && date <= end;
  // };

  // const todaySales = salesData.filter(sale => isToday(sale.createdAt));

  // let method;
  // let amount;

  // const totals = todaySales.reduce((acc, sale) => {
  //   method = sale.modeOfPayment || "Unknown";
  //   amount = sale.totalCartAmount || 0;

  //   acc[method] = (acc[method] || 0) + amount;
  //   return acc;
  // }, {});

  // const overallTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);
  
  // Utility: Filter by date
  const filterSales = (start, end) =>
    salesData.filter((sale) => {
      const created = new Date(sale.createdAt);
      // console.log("filtered sale: ", created >= start && created <= end)
      return created >= start && created <= end;
  });

  // Generate HTML -> PDF
  const generateReportPDF = (filtered, title) => {
    if (!filtered.length) {
      alert('لا توجد مبيعات في الفترة المحددة.');
      return;
    }
    const categoryGroups = {};
    
    filtered.forEach((sale) => {
      sale.items.forEach((itm) => {
        // const product = itm.product;
        const category =  'غير مصنف';
        const name = itm.product;
        if (!categoryGroups[category]) categoryGroups[category] = {};
        if (!categoryGroups[category][name]) {
          categoryGroups[category][name] = {
            name,
            quantity: 0,
            price: itm.unitSalePrice,
            total: 0,
          };
        }
        filtered.sort((a, b) => {
          if(a.name < b.name) return 1;
          if(a.name > b.name) return -1;
          return 0;
        })
        categoryGroups[category][name].quantity += itm.quantity;
        categoryGroups[category][name].total += itm.quantity * (itm.unitSalePrice);
      });
    });

    // Build HTML
    let grandTotal = 0;
    const reportDiv = document.createElement('div');
    reportDiv.style.direction = 'rtl';
    reportDiv.style.fontFamily = 'Cairo, Arial, sans-serif';
    reportDiv.style.padding = '20px';

    const titleEl = document.createElement('h2');
    titleEl.style.textAlign = 'center';
    titleEl.innerText = title;
    reportDiv.appendChild(titleEl);

    const dateRangeEl = document.createElement('p');
    dateRangeEl.style.textAlign = 'center';
    const startDate = moment(filtered[0].createdAt).format('DD-MM-YYYY');
    const endDate = moment(filtered[filtered.length - 1].createdAt).format('DD-MM-YYYY');
    dateRangeEl.innerText = `الفترة: ${startDate} - ${endDate}`;
    reportDiv.appendChild(dateRangeEl);

    Object.keys(categoryGroups).forEach((category) => {
      const items = Object.values(categoryGroups[category]);
      console.log("Items: ", items)
      const categoryTotal = items.reduce((acc, item) => acc + item.total, 0);
      grandTotal += categoryTotal;

      const catTitle = document.createElement('h3');
      catTitle.style.textAlign = 'right';
      catTitle.innerText = category;
      reportDiv.appendChild(catTitle);

      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '20px';
      table.style.textAlign = 'right';

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['الصنف', 'الكمية المباعة', 'الوحدة', 'سعر الوحدة', 'المجموع'].forEach((text) => {
        const th = document.createElement('th');
        th.innerText = text;
        th.style.border = '1px solid #000';
        th.style.padding = '5px';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      items.forEach((itm) => {
        const row = document.createElement('tr');
        [itm.name, itm.quantity, itm.unit, itm.price.toFixed(2), itm.total.toFixed(2)].forEach((text) => {
          const td = document.createElement('td');
          td.innerText = text;
          td.style.border = '1px solid #000';
          td.style.padding = '5px';
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });

      // Category total row
      const totalRow = document.createElement('tr');
      ['إجمالي الفئة', '', '', '', categoryTotal.toFixed(2)].forEach((text, i) => {
        const td = document.createElement('td');
        td.innerText = text;
        td.style.border = '1px solid #000';
        td.style.padding = '5px';
        td.style.fontWeight = i === 0 || i === 3 ? 'bold' : 'normal';
        totalRow.appendChild(td);
      });
      tbody.appendChild(totalRow);

      table.appendChild(tbody);
      reportDiv.appendChild(table);
    });

    const grandTotalEl = document.createElement('h3');
    grandTotalEl.style.textAlign = 'right';

    const paidGrandTotal = document.createElement('h3');
    paidGrandTotal.style.textAlign = 'right';

    grandTotalEl.innerText = `الإجمالي الكلي: ${grandTotal.toFixed(2)}`;
    reportDiv.appendChild(grandTotalEl);

    paidGrandTotal.innerText = `الإجمالي الكلي المدفوع:  ${grandTotal.toFixed(2)}`;
    reportDiv.appendChild(paidGrandTotal);

    html2pdf()
      .set({
        margin: 10,
        filename: `${title}_${moment().format('DD-MM-YYYY')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(reportDiv)
      .save();
  };

  // --- Button handlers ---
  const handleTodayReport = () => {
    const start = moment().startOf('day').toDate();
    const end = new Date();
    generateReportPDF(filterSales(start, end), 'تقرير اليوم');
  };

  const handleWeekReport = () => {
    const start = moment().startOf('week').toDate();
    const end = new Date();
    generateReportPDF(filterSales(start, end), 'تقرير الأسبوع');
  };

  const handleMonthReport = () => {
    const start = moment().startOf('month').toDate();
    const end = new Date();
    generateReportPDF(filterSales(start, end), 'تقرير الشهر');
  };

  const handleShiftReport = () => {
    const startOfDay = moment().startOf('day');
    const endOfDay = moment().endOf('day');
    let start, end;

    if (shift === 'morning') {
      start = startOfDay.toDate();
      end = moment(startOfDay).hour(16).minute(0).second(0).toDate();
    } else {
      start = moment(startOfDay).hour(16).minute(0).second(1).toDate();
      end = endOfDay.toDate();
    }
    generateReportPDF(filterSales(start, end), `تقرير الوردية (${shift === 'morning' ? 'صباحية' : 'مسائية'})`);
  };

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    // decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    console.log(salesData)
    const csv = generateCsv(csvConfig)(salesData);
    download(csvConfig)(csv);
  };

  const handleSaveCell = (cell, value) => {
    //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here
    tableData[cell.row.index][cell.column.id] = value;
    //send/receive api updates here
    setTableData([...tableData]); //re-render with new data
  };

  const customTableOptions = {
    renderTopToolbarCustomActions: ({ table }) => (
    <Box
      sx={{
        display: 'flex',
        gap: '16px',
        padding: '8px',
        flexWrap: 'wrap',
      }}
    >
      <Button
        color="lightblue"
        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
        onClick={handleExportData}
        leftIcon={<IconDownload />}
        variant="filled"
      >
        {t("EXPORT-ALL-DATA")}
      </Button>
      <Button
        disabled={table.getPrePaginationRowModel().rows.length === 0}
        //export all rows, including from the next page, (still respects filtering and sorting)
        onClick={() =>
          handleExportRows(table.getPrePaginationRowModel().rows)
        }
        leftIcon={<IconDownload />}
        variant="filled"
      >
        {t("EXPORT-ALL-ROWS")}
      </Button>
      <Button
        disabled={table.getRowModel().rows.length === 0}
        //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
        onClick={() => handleExportRows(table.getRowModel().rows)}
        leftIcon={<IconDownload />}
        variant="filled"
      >
        {t("EXPORT-PAGE-ROWS")}
      </Button>
      <Button
        disabled={
          !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        //only export selected rows
        onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
        leftIcon={<IconDownload />}
        variant="filled"
      >
        {t("EXPORT-SELECTED-ROWS")}
      </Button>
    </Box>
    ),
    renderRowActions: ({ row, table }) => {
      return (
        <Flex justify="space-between" sx={{width: "140px!important"}}>
          <Tooltip label="Delete" >
            <Button
              color="red"
              onClick={() => handleDelete(row)}
              // disabled={row?.original.registrations[0]?.department !== "lab" ? true : false}
            >
              <IconTrash color="white" />
            </Button>
          </Tooltip>
          {/* <Tooltip label="Edit">
            <Button
              color="blue"
              onClick={() => table.setEditingRow(row)}
              // disabled={row?.original.registrations[0]?.department !== "lab" ? true : false}
            >
              <IconEdit color="white" />
          </Button>
          </Tooltip> */}
          <Tooltip label="Return">
            <Button color="orange" onClick={() => handleReturn(row.original)}>
              <IconArrowBack />
            </Button>
          </Tooltip>
        </Flex>
      );
    },
    onRowSelectionChange: (updater) => {
      const newRowSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;

      setRowSelection(newRowSelection);

      // testing
      setCheckedRow(Object.keys(newRowSelection).map((rowId) => table.getRow(rowId).original))
      console.log(checkedRow)

      // If using MRT table instance (like with useMantineReactTable)
      const selectedData = Object.keys(newRowSelection).map((rowId) =>
        table.getRow(rowId).original
      );

      setCheckedRow(selectedData)

      // console.log('✅ Selected row data:', selectedData);
    },
    onEditingRowSave: async ({table, row, values}) => {
      //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
      tableData[row.index] = values;
      console.log(row.original)
      console.log(values)
      const id = row.original._id;
      try {
        const url = `${BASE_URL}/sales/update/${id}`
        const res = await axios.put(url, values)
        // console.log(res)
        if(res.status === 200) {
          setTableData([res.data]);
          showNotification({
            title: "success",
            message: "Inventory successfully updated!",
            color: "green"
          })
          table.setEditingRow(null); //exit editing mode
        }
      } catch (error) {
        console.log(error)
      }
      //send/receive api updates here
      // setTableData([...tableData]);
      // table.setEditingRow(null); //exit editing mode
    },
  }

  return (
    <Container size="100%">
      {/* <Title  mb="xs" color='blue' fz={30}>All sales</Title> */}
      {/* <Flex justify="space-between" px="lg">
        <Text>Total today: {salesTotals.total}</Text>
        <Text>Cash: {salesTotals.cash}</Text>
        <Text>Bankak: {salesTotals.bank}</Text>
      </Flex> */}
      <Box sx={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <DatePickerInput
          type="range"
          placeholder="اختر التاريخ"
          onChange={setValue}
          maw={250}
        />
        <Button color="steelblue" leftIcon={<IconReport />} onClick={() => generateReportPDF(filteredSales, 'تقرير مخصص')}>
          إنشاء تقرير
        </Button>
        <Button onClick={handleTodayReport}>تقرير اليوم</Button>
        <Button onClick={handleWeekReport}>تقرير الأسبوع</Button>
        <Button onClick={handleMonthReport}>تقرير الشهر</Button>
        <Select
          value={shift}
          onChange={setShift}
          data={[
            { value: 'morning', label: 'الوردية الصباحية' },
            { value: 'evening', label: 'الوردية المسائية' },
          ]}
          maw={180}
        />
        <Button onClick={handleShiftReport}>تقرير الوردية</Button>
      </Box>

      {/* <DataGrid data={salesData} columns={salesColumns} /> */}
      <CustomTable
        data={salesData} 
        columns={salesColumns} 
        // onRowClick={(row) => displayInvoice2(row)}
        renderTopToolbarCustomActions={customTableOptions.renderTopToolbarCustomActions}
        renderRowActions={customTableOptions.renderRowActions}
        onEditingRowSave={customTableOptions.onEditingRowSave}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        checkedRow={checkedRow}
        setCheckedRow={setCheckedRow}
        deleteModalOpen={deleteModalOpen} 
        setDeleteModalOpen={setDeleteModalOpen} 
        handleDelete={handleDelete}
        handleSaveCell={handleSaveCell}
        handleReturn={handleReturn}
      />
      {/* Edit Modal */}
      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Medicine">
        <TextInput
          label="Medicine Name"
          value={editRow?.name || ''}
          onChange={(e) => setEditRow({ ...editRow, name: e.target.value })}
        />
        <TextInput
          label="Category"
          value={editRow?.category || ''}
          onChange={(e) => setEditRow({ ...editRow, category: e.target.value })}
        />
        <Group position="right" mt="md">
          <Button onClick={handleSaveEdit}>Save</Button>
        </Group>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
        <p>Are you sure you want to delete <strong>{deleteRow?.product}</strong>?</p>
        <Group position="right" mt="md">
          <Button color="red" onClick={confirmDelete}>Delete</Button>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
        </Group>
      </Modal>

      {/* Return Confirmation Modal */}
      <Modal opened={returnModalOpen} onClose={() => setReturnModalOpen(false)} title="Confirm Return">
        <p>Are you sure you want to return this sale?</p>
        <Group position="right" mt="md">
          <Button color="yellow" onClick={confirmReturn}>Return</Button>
          <Button variant="outline" onClick={() => setReturnModalOpen(false)}>Cancel</Button>
        </Group>
      </Modal>
      {/* cash modal */}
    </Container>
  );
};

export default ProductSales;