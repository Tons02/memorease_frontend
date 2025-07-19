import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Paper,
  TableContainer,
  Checkbox,
  FormControlLabel,
  TextField,
  Skeleton,
  Box,
  MenuItem,
  Menu,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

const TableComponent = ({
  columns = [],
  data = [],
  isLoading = false,
  isError = false,
  error = null,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  search,
  setSearch,
  setStatus,
  status,
  actionsRender = () => null,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderTop: "1px solid #ccc",
        maxHeight: 650,
        minHeight: 450,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ padding: 1.5 }}
      >
        {status !== "active" && status !== "inactive" ? (
          <FormControl sx={{ width: 150 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <FormControlLabel
            control={
              <Checkbox
                color="success"
                checked={status === "inactive"}
                onChange={(e) =>
                  setStatus(e.target.checked ? "inactive" : "active")
                }
              />
            }
            label="Archived"
          />
        )}
        <TextField
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SearchIcon sx={{ fontSize: 18 }} />
              Search
            </Box>
          }
          variant="outlined"
          value={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(e.target.value);
            }
          }}
          sx={{
            width: 250,
            height: 50,
            marginTop: 1,
            marginRight: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: "15px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "15px",
              height: 50,
              "& fieldset": {
                borderColor: "#5a6872",
              },
              "&:hover fieldset": {
                borderColor: "#5a6872",
              },
            },
          }}
        />
      </Box>

      {/* Table section */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.field} align={col.align || "left"}>
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col, index) => (
                    <TableCell key={index} align={col.align || "left"}>
                      <Skeleton width="80%" />
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Skeleton width="80%" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  Error: {error?.message}
                </TableCell>
              </TableRow>
            ) : data?.length > 0 ? (
              data.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.field} align={col.align || "left"}>
                      {typeof col.renderCell === "function"
                        ? col.renderCell({ row })
                        : typeof col.valueGetter === "function"
                        ? col.valueGetter(row)
                        : row[col.field]}{" "}
                    </TableCell>
                  ))}

                  <TableCell align="center">{actionsRender(row)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  No Data Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          padding: 1,
          borderTop: "1px solid #ccc",
        }}
      >
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </TableContainer>
  );
};

export default TableComponent;
