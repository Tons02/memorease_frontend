import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useGetTermsQuery } from "../redux/slices/terms";

const TermsAndAgreementCustomer = () => {
  const [terms, setTerms] = useState("");

  const { data: termsData, isLoading } = useGetTermsQuery({
    pagination: "none",
  });

  // Load existing terms into editor
  useEffect(() => {
    if (termsData?.data) {
      setTerms(termsData.data[0]?.terms);
    }
  }, [termsData]);
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box
        sx={{
          border: "1px solid #ddd",
          p: 4,
          borderRadius: 2,
          bgcolor: "#f9f9f9",
        }}
        dangerouslySetInnerHTML={{ __html: terms }}
      />
    </Box>
  );
};

export default TermsAndAgreementCustomer;
