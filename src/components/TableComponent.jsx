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
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
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
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
        maxHeight: 550,
        minHeight: 550,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Header section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: 2,
          backgroundColor: "#fafafa",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Only render status filter if status and setStatus props are provided */}
        {status !== undefined && setStatus !== undefined && (
          <>
            {status !== "active" && status !== "inactive" ? (
              <FormControl
                sx={{
                  width: 160,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    height: 45,
                  },
                }}
              >
                <InputLabel id="status-label">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <FilterListIcon sx={{ fontSize: 16 }} />
                    Status
                  </Box>
                </InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="approved">
                    <Chip
                      label="Approved"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </MenuItem>
                  <MenuItem value="canceled">
                    <Chip
                      label="Canceled"
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  </MenuItem>
                  <MenuItem value="pending">
                    <Chip
                      label="Pending"
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Chip
                      label="Rejected"
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  </MenuItem>
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
                    sx={{
                      "&.Mui-checked": {
                        color: "#10b981",
                      },
                    }}
                  />
                }
                label="Show Archived"
                sx={{
                  backgroundColor:
                    status === "inactive" ? "#f0fdf4" : "transparent",
                  borderRadius: "8px",
                  padding: "4px 8px",
                  margin: 0,
                }}
              />
            )}
          </>
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
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(e.target.value);
            }
          }}
          sx={{
            width: 280,
            // Add marginLeft auto when status is not shown to push search to the right
            ...(status === undefined && { marginLeft: "auto" }),
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              height: 48,
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease",
              "& fieldset": {
                borderColor: "#d1d5db",
              },
              "&:hover fieldset": {
                borderColor: "#6b7280",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1E6F2A",
                borderWidth: "2px",
              },
            },
          }}
        />
      </Box>

      {/* Enhanced Table section with column separators */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Table
          sx={{
            minWidth: 650,
            "& .MuiTableHead-root": {
              position: "sticky",
              top: 0,
              zIndex: 1,
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                background:
                  "linear-gradient(135deg, #1E6F2A 0%, #66cc59ff 100%)",
                "& .MuiTableCell-head": {
                  background: "transparent",
                  fontWeight: 700,
                  color: "#ffffff",
                  borderBottom: "none",
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "0.700rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  "&:last-child": {
                    borderRight: "none",
                  },
                },
              }}
            >
              {columns.map((col, index) => (
                <TableCell
                  key={col.field}
                  align={col.align || "left"}
                  sx={{
                    position: "relative",
                    "&::before":
                      index > 0
                        ? {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: "20%",
                            bottom: "20%",
                            width: "1px",
                            backgroundColor: "rgba(108, 255, 71, 0.2)",
                          }
                        : {},
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {columns.map((col, index) => (
                    <TableCell
                      key={index}
                      align={col.align || "left"}
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        "&:last-child": {
                          borderRight: "none",
                        },
                      }}
                    >
                      <Skeleton
                        width="80%"
                        height={24}
                        sx={{ borderRadius: "4px" }}
                      />
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: "1px solid #e5e7eb",
                      padding: "16px",
                    }}
                  >
                    <Skeleton
                      width="80%"
                      height={24}
                      sx={{ borderRadius: "4px" }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  align="center"
                  sx={{
                    padding: "60px 16px",
                    color: "#ef4444",
                    fontWeight: 500,
                    backgroundColor: "#fef2f2",
                  }}
                >
                  ⚠️ Error: {error?.message}
                </TableCell>
              </TableRow>
            ) : data?.length > 0 ? (
              data.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      "& .MuiTableCell-root": {
                        borderColor: "#e2e8f0",
                      },
                    },
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={col.field}
                      align={col.align || "left"}
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                        borderRight: "1px solid #f3f4f6",
                        padding: "16px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                        "&:last-of-type": {
                          borderRight: "1px solid #f3f4f6",
                        },
                        position: "relative",
                      }}
                    >
                      {typeof col.renderCell === "function"
                        ? col.renderCell({ row })
                        : typeof col.valueGetter === "function"
                        ? col.valueGetter(row)
                        : row[col.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  align="center"
                  sx={{
                    padding: "60px 16px",
                    color: "#6b7280",
                    fontStyle: "italic",
                    backgroundColor: "#f9fafb",
                    fontSize: "1rem",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: "3rem",
                        opacity: 0.3,
                      }}
                    >
                      📋
                    </Box>
                    <Box>No Data Found</Box>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Enhanced Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#fafafa",
          "& .MuiTablePagination-root": {
            overflow: "visible",
          },
          "& .MuiTablePagination-toolbar": {
            minHeight: "52px",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              fontSize: "0.875rem",
              color: "#6b7280",
              fontWeight: 500,
            },
          "& .MuiIconButton-root": {
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#e5e7eb",
            },
          },
        }}
      >
        <Box
          sx={{
            fontSize: "0.875rem",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          Showing {Math.min(page * rowsPerPage + 1, data.length)} -{" "}
          {Math.min((page + 1) * rowsPerPage, data.length)} of {data.length}{" "}
          entries
        </Box>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "& .MuiSelect-select": {
              borderRadius: "6px",
              fontSize: "0.875rem",
            },
          }}
        />
      </Box>
    </TableContainer>
  );
};

export default TableComponent;
