import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Tooltip } from '@mantine/core';
import { IconArrowBack, IconDownload, IconEdit, IconTrash } from '@tabler/icons-react';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { useState } from 'react';
import axios from 'axios';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

const DataGrid = ({ data, columns, deleteModalOpen, setDeleteModalOpen, handleDelete, isModalOpen, setIsModalOpen, setInvoiceData, invoiceData, displayInvoice, handleReturn }) => {

  const BASE_URL = import.meta.env.VITE_URL

  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const { t } = useTranslation();

  const handleSaveCell = (cell, value) => {
    //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here
    tableData[cell.row.index][cell.column.id] = value;
    //send/receive api updates here
    setTableData([...tableData]); //re-render with new data
  };

  const handleSaveRow = async ({ table, row, values }) => {
    //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
    tableData[row.index] = values;
    //send/receive api updates here
    setTableData([...tableData]);
    table.setEditingRow(null); //exit editing mode
  };
  
  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useMantineReactTable({
    columns: columns,
    data: data, // Use the correct prop name
    enableEditing: true,
    editDisplayMode:"row",
    renderRowActions: ({ row, table }) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Default edit icons */}
        {table.options.enableEditing && (
          <>
            <Tooltip label="Edit">
              <ActionIcon onClick={() => table.setEditingRow(row)}>
                <IconEdit />
              </ActionIcon>
            </Tooltip>
          </>
        )}
        {/* Custom delete button */}
        <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => handleDelete(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Return">
          <ActionIcon color="orange" onClick={() => handleReturn(row.original)}>
            <IconArrowBack />
          </ActionIcon>
        </Tooltip>
      </div>
    ),
    onEditingRowSave: async ({table, row, values}) => {
      //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
      tableData[row.index] = values;
      console.log(row.original)
      console.log(values)
      const id = row.original._id;
      try {
        const url = `${BASE_URL}/inventory/update/${id}`
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
    enableRowSelection: true,
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    initialState: {
      pagination: { pageSize: 5 },
      density: 'xs',
      sorting: [
        {
          id: 'orderDate', // Sort by the 'orderDate' column
          desc: true, // Sort in descending order (newest first)
        },
      ],
    },
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
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => displayInvoice(row),
      style: { cursor: 'pointer' }, // Change cursor to pointer on hover
    }),
  });
  
  // const displayInvoice = async (row) => {

  //   setSelectedRow(row.original); // Store the clicked row's data
  //   setIsModalOpen(true); // Open the modal
  //   console.log(selectedRow)
    
  //   const url = `${BASE_URL}/orders/${selectedRow._id}`
  //   console.log(url)

  //   try {
  //     const response = await axios.get(url);
  //     if(response.status === 200) {
  //       setInvoiceData(response.data)
  //       console.log(invoiceData)
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  return (
    <MantineReactTable
      table={table}
      mantineEditTextInputProps={({ cell }) => ({
        //onBlur is more efficient, but could use onChange instead
        onBlur: (event) => {
          handleSaveCell(cell, event.target.value);
          console.log(cell)
        },
      })}
      positionGlobalFilter="right"
      mantineSearchTextInputProps={{
        // placeholder: `Search ${data.length} rows`,
        sx: { minWidth: '300px' },
        variant: 'filled',
      }}
    />
  );
};

export default DataGrid;