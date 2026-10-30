package com.inventory.service;

import com.inventory.entity.Product;
import com.inventory.entity.StockTransaction;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportInventoryCsv() {
        List<Product> products = productRepository.findAll(Sort.by("name").ascending());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Product ID,SKU,Product Name,Category,Unit,Current Stock,Min Stock,Reorder Level,Max Stock,Purchase Price,Selling Price,Total Valuation,Supplier");

            for (Product p : products) {
                String category = p.getCategory() != null ? p.getCategory().getName() : "Unassigned";
                String supplier = p.getSupplier() != null ? p.getSupplier().getSupplierName() : "None";
                double valuation = p.getCurrentStock() * p.getPurchasePrice().doubleValue();

                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",%d,%d,%d,%d,%.2f,%.2f,%.2f,\"%s\"%n",
                        p.getId(),
                        p.getSku(),
                        p.getName().replace("\"", "\"\""),
                        category.replace("\"", "\"\""),
                        p.getUnit(),
                        p.getCurrentStock(),
                        p.getMinimumStockLevel(),
                        p.getReorderLevel(),
                        p.getMaximumStockLevel(),
                        p.getPurchasePrice(),
                        p.getSellingPrice(),
                        valuation,
                        supplier.replace("\"", "\"\"")
                );
            }
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportTransactionsCsv(Instant startDate, Instant endDate) {
        List<StockTransaction> transactions = transactionRepository.filterTransactions(
                null, null, startDate, endDate, null, PageRequest.of(0, 10000, Sort.by("transactionDate").descending())
        ).getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Transaction ID,Date,Reference Number,Product SKU,Product Name,Transaction Type,Quantity,Previous Stock,Updated Stock,Unit Price,Supplier,Performed By,Remarks");

            for (StockTransaction t : transactions) {
                String sku = t.getProduct() != null ? t.getProduct().getSku() : "";
                String prodName = t.getProduct() != null ? t.getProduct().getName() : "";
                String supplier = t.getSupplier() != null ? t.getSupplier().getSupplierName() : "";
                String user = t.getPerformedByUser() != null ? t.getPerformedByUser().getFullName() : "System";
                String remarks = t.getRemarks() != null ? t.getRemarks() : "";

                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,%d,%d,%.2f,\"%s\",\"%s\",\"%s\"%n",
                        t.getId(),
                        t.getTransactionDate(),
                        t.getReferenceNumber().replace("\"", "\"\""),
                        sku,
                        prodName.replace("\"", "\"\""),
                        t.getTransactionType(),
                        t.getQuantity(),
                        t.getPreviousStock(),
                        t.getUpdatedStock(),
                        t.getUnitPrice(),
                        supplier.replace("\"", "\"\""),
                        user.replace("\"", "\"\""),
                        remarks.replace("\"", "\"\"")
                );
            }
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}

