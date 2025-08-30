import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  useAddTermsMutation,
  useGetTermsQuery,
  useUpdateTermsMutation,
} from "../../redux/slices/terms";
import { Box, Breadcrumbs, Button, Link, Typography } from "@mui/material";
import { toast } from "sonner";
import { Dashboard } from "@mui/icons-material";
import GavelIcon from "@mui/icons-material/Gavel";
import ListAltIcon from "@mui/icons-material/ListAlt";

const TermsAndAgreement = () => {
  const { data: termsData, isLoading } = useGetTermsQuery({
    pagination: "none",
  });
  const [addTerms] = useAddTermsMutation();
  const [updateTerms] = useUpdateTermsMutation();

  const [terms, setTerms] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Load existing terms into editor
  useEffect(() => {
    if (termsData?.data) {
      setTerms(termsData.data[0]?.terms); // single object
      setEditingId(termsData.data[0]?.id);
    }
  }, [termsData]);

  const handleSave = async () => {
    try {
      if (termsData?.data[0]) {
        // ✅ Update existing record
        const res = await updateTerms({
          id: termsData.data[0]?.id,
          terms,
        }).unwrap();
        toast.success("Terms and agreement updated successfully!");
      } else {
        // ✅ Create if no record exists
        const res = await addTerms({ terms }).unwrap();
        toast.success("Terms and agreement created successfully!");
      }
    } catch (error) {
      console.error("Error saving Terms and agreement:", error);
      toast.error("Failed to save Terms and agreement!");
    }
  };

  if (isLoading) return <p>Loading terms...</p>;

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 1 }}>
        <Link
          underline="hover"
          sx={{ display: "flex", alignItems: "center" }}
          color="inherit"
          href="/"
        >
          <Dashboard sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>

        <Link
          underline="hover"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
          color="inherit"
          href="/Admin/masterlist"
        >
          <ListAltIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Masterlist
        </Link>
        <Typography
          sx={{ color: "text.primary", display: "flex", alignItems: "center" }}
        >
          <GavelIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Terms and Agreement
        </Typography>
      </Breadcrumbs>
      <Typography variant="h4" sx={{ mr: 2, fontWeight: 600 }}>
        Terms and Agreement
      </Typography>
      <Box sx={{ p: 3 }}>
        {/* React Quill editor */}
        <ReactQuill
          theme="snow"
          value={terms}
          onChange={setTerms}
          style={{ height: "300px", marginBottom: "40px" }}
        />

        {/* Button aligned right */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            sx={{ mt: 2, borderRadius: 2, textTransform: "none" }}
          >
            {editingId ? "Update Terms" : "Save Terms"}
          </Button>
        </Box>

        {/* Preview */}
        <Typography variant="subtitle1" fontWeight="bold" mt={4} mb={1}>
          Preview
        </Typography>
        <Box
          sx={{
            border: "1px solid #ddd",
            p: 2,
            borderRadius: 2,
            bgcolor: "#f9f9f9",
          }}
          dangerouslySetInnerHTML={{ __html: terms }}
        />
      </Box>
    </>
  );
};

export default TermsAndAgreement;
