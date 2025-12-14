import React, { useEffect, useState, useMemo } from 'react';
import { Box, Button, Flex, Modal, Tooltip } from '@mantine/core';
import SupplierForm from '../components/SupplierForm';
import DataGrid from '../components/DataGrid';
import { IconAccessible, IconArrowBack, IconArrowLeft, IconDoorExit, IconEdit, IconHistory, IconTrash } from '@tabler/icons-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InvoiceTemplate from '../components/InvoiceTemplate';
import CustomTable from '../components/CustomTable';

const Suppliers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierId = searchParams.get("supplierId");
  const supplierColumns = useMemo(
    () => [
      { accessorKey: "orderID", header: t("Order-ID"), size: 150 },
      { accessorKey: "supplierName", header: t("Supplier-Name"), size: 150 },
      {
        header: t("Ordered-Products"),
        accessorFn: (row) => {
          if (!row.products || row.products.length === 0) return t("No Products");
      
          // Get the first 3 products
          const displayedProducts = row.products.slice(0, 3);
      
          // Format the displayed products
          let productList = displayedProducts
            .map((p) => `${p.product} - ${p.quantity} ${p.unit}`)
            .join(", ");
      
          // If there are more products, add a "..." indicator
          if (row.products.length > 3) {
            productList += `, ... (${t("click for more")})`;
          }
      
          return productList;
        },
      },
      { accessorKey: "totalOrderPrice", header: t("Total-Price"), size: 120 },
      { accessorKey: "paymentMethod", header: t("Payment-Method"), size: 120 },
      {
        accessorKey: "isOrderPaid",
        header: t("Payment-Status"),
        Cell: ({ cell }) => (cell.getValue()  ? `✅ ${t("Paid")}` : `❌ ${t("Not-Paid")}`),
      },
      {
        accessorKey: "isOrderPaid",
        header: t("Payment-Progress"),
        Cell: ({ cell }) => (cell.getValue()),
      },
      {
        accessorKey: "orderDate",
        header: t("Order-Date"),
        Cell: ({ cell }) =>
          new Date(cell.getValue()).toLocaleDateString("en-US"),
      },
      {
        accessorKey: "deliveryDate",
        header: t("DELIVERY-DATE"),
        Cell: ({ cell }) =>
          new Date(cell.getValue()).toLocaleDateString("en-US"),
      },
    ],
    [t]
  );
  const BASE_URL = import.meta.env.VITE_URL
  
  const [suppliersData, setSuppliersData] = useState([]);
  const [opened, setOpened] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState([]);

  // copied from ahs ==> states for table management
  const [rowSelection, setRowSelection] = useState({});
  const [checkedRow, setCheckedRow] = useState([])
  

  const handleAddSupplier = (newSupplier) => {
    setSuppliersData((prevData) => [
      ...prevData,
      { ...newSupplier, productCount: 130, orderCount: 23 },
    ]);
  };

  const fetchSuppliers = async () => {
    try {
      const url = `${BASE_URL}/supplier/list`;
      const response = await axios.get(url);
      console.log(response.data)
      setSuppliersData(response.data.supplier);
      console.log(suppliersData)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    async function fetchSupplierOrders() {
      if (!supplierId) return;
      try {
        const response = await axios.get(
          `${BASE_URL}/supplier/orders?supplierId=${supplierId}`
        );
        console.log("API Response:", response.data);
  
        if (response.data && response.data.supplier) {
          // Extract orders and add supplier name for reference
          const formattedOrders = response.data.supplier.orders.map((order) => ({
            ...order,
            supplierName: response.data.supplier.name, // Include supplier name
          }));
  
          setSuppliersData(formattedOrders);
          console.log("formatted order:", formattedOrders)
        } else {
          console.error("Unexpected API response structure:", response.data);
          setSuppliersData([]);
        }
      } catch (error) {
        console.error("Error fetching supplier orders:", error);
        setSuppliersData([]);
      }
    }
  
    fetchSupplierOrders();
  }, [supplierId]);
  
  const returnBack = () => {
    navigate(-1);
  }

  const displayInvoice = async (row) => {
    setSelectedRow(row.original); // Store the clicked row's data
    setIsModalOpen(true); // Open the modal
    console.log(selectedRow)
    
    const url = `${BASE_URL}/orders/${selectedRow._id}`
    console.log(url)

    try {
      const response = await axios.get(url);
      if(response.status === 200) {
        setInvoiceData(response.data)
        console.log(invoiceData)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const displayInvoice2 = async (row) => {
    console.log("row log: ", row)
    setSelectedRow(row); // Store the clicked row's data
    setIsModalOpen(true); // Open the modal
    // setInventoryData(row)
  }

  const customTableOptions = {
    renderTopToolbarCustomActions: ({ table }) => (
    <Box
      sx={{
        display: 'flex',
        gap: '16px',
        // padding: '8px',
        flexWrap: 'wrap',
      }}
    >
      <Button 
        color="lime" 
        // leftIcon={<IconUserPlus />} 
        mb="sm"
        onClick={() => setOpened(!opened)}
        disabled={
          table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
      >
        {t("دفع")}
      </Button>
      <Button
        color="green"
        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
        onClick={() => setAddProcedureOpened(!addProcedureOpened)}
        // leftIcon={<IconPlus />}
        variant="outline"
        disabled={
          !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
      >
        {t("إضافة قسط")}
      </Button>
      <Button
        disabled={
          !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        //export all rows, including from the next page, (still respects filtering and sorting)
        // onClick={}
        leftIcon={<IconHistory />}
        variant="filled"
      >
        {t("عرض سجل الأقساط")}
      </Button>
      <Button
        disabled={
          !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
        onClick={() => setExitPermissionModal(true)}
        leftIcon={<IconDoorExit />}
        variant="outline"
        color='red'
      >
        {t("إرجاع")}
      </Button>
    </Box>
    ),
    renderRowActions: ({ row }) => {
      return (
        <Flex justify="flex-start">
          <Tooltip label="Delete" >
            <Button
              mr="md"
              color="red"
              // onClick={() => handleActionClick(row.original)}
              onClick={() => handleDelete()}
              // disabled={row?.original.registrations[0]?.department !== "lab" ? true : false}
            >
              <IconTrash color="white" />
            </Button>
          </Tooltip>
          <Tooltip label="Edit">
            <Button
              color="blue"
              onClick={() => setEditPatientModal(true)}
              // onClick={() => console.log(row.original)}
              // disabled={row?.original.registrations[0]?.department !== "lab" ? true : false}
            >
              <IconEdit color="white" />
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
  }

  return (
    <Box>
      <Flex mb="xs" justify="space-between">
        <Button variant="outline" color="blue" leftIcon={<IconArrowLeft />} onClick={() => returnBack()} >{t("RETURN")}</Button>
        {/* <Button variant='filled' color="yellow" leftIcon={<IconAccessible />} onClick={() => setOpened(!opened)}>{t("ADD-SUPPLIER")}</Button> */}
      </Flex>
      {/* <DataGrid data={suppliersData} columns={supplierColumns} displayInvoice={displayInvoice} /> */}
       <CustomTable
        data={suppliersData} 
        columns={supplierColumns} 
        onRowClick={(row) => displayInvoice2(row)}
        renderTopToolbarCustomActions={customTableOptions.renderTopToolbarCustomActions}
        renderRowActions={customTableOptions.renderRowActions}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        checkedRow={checkedRow}
        setCheckedRow={setCheckedRow}
      />
      <SupplierForm opened={opened} setOpened={setOpened} handleAddSupplier={handleAddSupplier} />
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size={"70rem"}
        // title="Invoice Details"
        fullScreen        
      >
        {selectedRow && <InvoiceTemplate order={selectedRow} />}
      </Modal>
    </Box>
  );
};

export default Suppliers;