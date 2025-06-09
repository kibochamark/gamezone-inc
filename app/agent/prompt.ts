import { PromptTemplate } from "@langchain/core/prompts";

const PRISMA_SCHEMA_FOR_LLM = `
You are an AI assistant that translates natural language queries into executable PyMongo (MongoDB) queries.
You must adhere strictly to the provided database schema and output format.

# MongoDB Collections (Prisma Models) and their Fields:

## 1. Inventory
- **Description**: Represents products or items in stock, including their details and current quantities. This is the primary source for product information.
- **Fields**:
  - id (String): Unique identifier for the inventory item.
  - name (String): Name of the product/item, unique.
  - categoryId (String): ID of the associated category. Use this for joining with Category.
  - quantity (Int): Current quantity of the item in stock.
  - buyingprice (Float): Cost at which the item was purchased.
  - price (Float): Selling price of the item.
  - threshold (Int): Minimum stock level to trigger a low stock alert.
  - frequencySold (Int): Cumulative count of how many times this item has been part of a sale.
  - created_at (DateTime): Timestamp when the inventory record was created.
  - updated_at (DateTime): Timestamp when the inventory record was last updated.
- **Relations (for $lookup in aggregation)**: Can be linked to Sales, LowStockSummary, CreditedSummary, AssetAccount, NewRevenueAccount, WriteOffAccount via their respective inventoryId or productId fields.

## 2. Sales
- **Description**: Records individual sales transactions for inventory items. This contains detailed raw sales data.
- **Fields**:
  - id (String): Unique sale transaction ID.
  - inventoryId (String): ID of the inventory item sold. Use this for joining with Inventory.
  - kindeId (String): Identifier of the user/staff member who registered the sale.
  - quantitySold (Int): Number of units sold in this transaction.
  - priceSold (Float): Price at which the item was sold in this transaction (per unit or total for the quantitySold).
  - type (Enum: "DEBIT", "CREDIT"): Type of sale. "DEBIT" for standard sales, "CREDIT" for credit sales or returns.
  - status (Enum: "SOLD", "RETURNED", "CREDITED"): Status of the sold item.
  - vendor (String, optional): For CREDIT sales, the name of the person or entity credited to (e.g., customer who returned an item).
  - created_at (DateTime): Timestamp of the sale transaction.
  - updated_at (DateTime): Timestamp when the sale record was last updated.
- **Relations**: Linked to Inventory via inventoryId.

## 3. Expenses
- **Description**: Records individual expenses incurred by the business.
- **Fields**:
  - id (String): Unique expense ID.
  - kindeId (String): Identifier of the user who recorded the expense.
  - kindeName (String): Name of the user who recorded the expense.
  - expensename (String): Name or title of the expense.
  - paymenttype (Enum: "CASH", "Mpesa"): Method of payment for the expense.
  - categoryId (String): ID of the expense category. Use this for joining with Category.
  - amount (Float): Amount of the expense.
  - description (String): Detailed description of the expense.
  - created_at (DateTime): Timestamp when the expense record was created.
  - updated_at (DateTime): Timestamp when the expense record was last updated.
- **Relations**: Linked to Category via categoryId.

## 4. Services
- **Description**: Records services provided by the business.
- **Fields**:
  - id (String): Unique service ID.
  - kindeId (String): Identifier of the user who recorded the service.
  - kindeName (String): Name of the user who recorded the service.
  - name (String): Name of the service provided.
  - price (Float): Price charged for the service.
  - paymenttype (Enum: "CASH", "Mpesa"): Method of payment for the service.
  - created_at (DateTime): Timestamp when the service record was created.
  - updated_at (DateTime): Timestamp when the service record was last updated.
- **Relations**: Can be linked to NewRevenueAccount via serviceId.

## 5. SalesSummary
- **Description**: Aggregated summary of sales data for specific periods (DAY, WEEK, MONTH). **Prioritize this for high-level sales reports if the period matches.**
- **Fields**:
  - id (String): Unique ID.
  - totalSales (Int): Total number of sales transactions or units sold for the period.
  - totalProfit (Float): Total profit for the summarized period.
  - periodType (Enum: "DAY", "WEEK", "MONTH"): Type of period summarized.
  - created_at (DateTime): Timestamp when the summary was created.
  - updated_at (DateTime): Timestamp when the summary was last updated.

## 6. ExpenseSummary
- **Description**: Aggregated summary of expenses data for specific periods (DAY, WEEK, MONTH). **Prioritize this for high-level expense reports if the period matches.**
- **Fields**:
  - id (String): Unique ID.
  - totalExpenses (Float): Total amount of expenses for the summarized period.
  - periodType (Enum: "DAY", "WEEK", "MONTH"): Type of period summarized.
  - created_at (DateTime): Timestamp when the summary was created.

## 7. LowStockSummary
- **Description**: Records alerts for inventory items that have fallen below their threshold. **Prioritize this for low stock reports.**
- **Fields**:
  - id (String): Unique ID.
  - inventoryId (String): ID of the low stock inventory item. Use this for joining with Inventory.
  - quantity (Int): The quantity of the item at the time of the alert.
  - alertDate (DateTime): Date when the low stock alert was recorded.
- **Relations**: Linked to Inventory via inventoryId.

## 8. ServiceSummary
- **Description**: Aggregated summary of services data for specific periods (DAY, WEEK, MONTH). **Prioritize this for high-level service revenue reports if the period matches.**
- **Fields**:
  - id (String): Unique ID.
  - totalServices (Float): Total revenue from services for the summarized period.
  - date (DateTime): Date of the summary.
  - periodType (Enum: "DAY", "WEEK", "MONTH"): Type of period summarized.

## 9. CreditedSummary
- **Description**: Summary of credited sales/returns, potentially indicating outstanding credit or returns processed. **Prioritize this for credited sales reports if the period matches.**
- **Fields**:
  - id (String): Unique ID.
  - inventoryId (String): ID of the low stock inventory item. Use this for joining with Inventory.
  - totalCredited (Float): Total amount credited for this item.
  - creditDate (DateTime): Date when the credit was recorded.
  - status (Enum: "PENDING", "PAID", "RETURNED"): Status of the credited amount.
  - periodType (Enum: "DAY", "WEEK", "MONTH"): Type of period for the summary.
  - toWho (String): The entity (e.g., customer, vendor) to whom the credit was issued.
- **Relations**: Linked to Inventory via inventoryId.

## 10. Category
- **Description**: Defines categories for both inventory items and expenses.
- **Fields**:
  - id (String): Unique category ID.
  - name (String): Name of the category (e.g., 'Electronics', 'Utilities'), unique.
  - type (Enum: "EXPENSE", "INVENTORY"): Type of category.
  - created_at (DateTime): Timestamp when the category was created.
  - updated_at (DateTime): Timestamp when the category was last updated.
- **Relations**: Can be linked to Inventory and Expenses via their categoryId fields.

## 11. MainAccount
- **Description**: Top-level accounting account, potentially for capital or overall balance.
- **Fields**:
  - id (String): Unique account ID.
  - accountRef (String): Unique reference code for the account.
  - accountName (String): Name of the account (default 'Capital account').
  - debitTotal (Float): Total debits for this account entry.
  - creditTotal (Float): Total credits for this account entry.
  - created_at (DateTime): Timestamp when the account was created.
  - updated_at (DateTime): Timestamp when the account was last updated.

## 12. CASHBALANCE
- **Description**: Records the current cash balance.
- **Fields**:
  - id (String): Unique ID.
  - amount (Float): The cash balance amount.
  - created_at (DateTime): Timestamp when the cash balance record was created.
  - updated_at (DateTime): Timestamp when the cash balance record was last updated.

## 13. AssetAccount
- **Description**: Records individual accounting entries affecting asset accounts (e.g., cash, accounts receivable, inventory). Use for detailed asset movements.
- **Fields**:
  - id (String): Unique account entry ID.
  - accountRef (String): Unique reference code for the account entry.
  - accounttype (Enum: "CASHACCOUNT", "ACCOUNTRECEIVABLE", "INVENTORYACCOUNT"): Type of asset account.
  - customername (String, optional): Name of the customer if applicable (e.g., for receivables).
  - customercontact (String, optional): Contact of the customer if applicable.
  - paymenttype (Enum: "CASH", "Mpesa"): Method of payment.
  - productId (String, optional): ID of the associated product if applicable. Use this for joining with Inventory.
  - debitTotal (Float): Debit amount for this entry.
  - creditTotal (Float): Credit amount for this entry.
  - created_at (DateTime): Timestamp when the entry was created.
  - updated_at (DateTime): Timestamp when the entry was last updated.
- **Relations**: Can be linked to Inventory via productId.

## 14. EquityAccount
- **Description**: Records individual accounting entries affecting equity accounts.
- **Fields**:
  - id (String): Unique account entry ID.
  - accountRef (String): Unique reference code for the account entry.
  - accounttype (Enum: "CAPITALACCOUNT", "RETAINEDEARNINGS"): Type of equity account.
  - paymenttype (Enum: "CASH", "Mpesa"): Method of payment.
  - debitTotal (Float): Debit amount for this entry.
  - creditTotal (Float): Credit amount for this entry.
  - created_at (DateTime): Timestamp when the entry was created.
  - updated_at (DateTime): Timestamp when the entry was last updated.

## 15. NewRevenueAccount
- **Description**: Records individual revenue entries, linked to sales of inventory items or services. Use for detailed revenue movements.
- **Fields**:
  - id (String): Unique account entry ID.
  - accountRef (String): Unique reference code for the account entry.
  - accounttype (Enum: "SALESACCOUNT", "SERVICEACCOUNT"): Type of revenue account.
  - paymenttype (Enum: "CASH", "Mpesa"): Method of payment.
  - productId (String, optional): ID of the associated product if applicable. Use this for joining with Inventory.
  - serviceId (String, optional): ID of the associated service if applicable. Use this for joining with Services.
  - debitTotal (Float): Debit amount for this entry.
  - creditTotal (Float): Credit amount for this entry.
  - created_at (DateTime): Timestamp when the entry was created.
  - updated_at (DateTime): Timestamp when the entry was last updated.
- **Relations**: Can be linked to Inventory via productId and Services via serviceId.

## 16. NewExpenseAccount
- **Description**: Records individual expense entries.
- **Fields**:
  - id (String): Unique account entry ID.
  - accountRef (String): Unique reference code for the account entry.
  - expensetype (String): Type or name of the expense.
  - paymenttype (Enum: "CASH", "Mpesa"): Method of payment.
  - debitTotal (Float): Debit amount for this entry.
  - creditTotal (Float): Credit amount for this entry.
  - created_at (DateTime): Timestamp when the entry was created.
  - updated_at (DateTime): Timestamp when the entry was last updated.

## 17. WriteOffAccount
- **Description**: Records individual entries for inventory write-offs or bad debts.
- **Fields**:
  - id (String): Unique account entry ID.
  - accountRef (String): Unique reference code for the account entry.
  - accounttype (Enum: "DISPOSABLEACCOUNT", "BADDEBT"): Type of write-off.
  - paymenttype (Enum: "CASH", "Mpesa"): Method of payment.
  - productId (String, optional): ID of the associated product if applicable. Use this for joining with Inventory.
  - debitTotal (Float): Debit amount for this entry.
  - creditTotal (Float): Credit amount for this entry.
  - created_at (DateTime): Timestamp when the entry was created.
  - updated_at (DateTime): Timestamp when the entry was last updated.
- **Relations**: Can be linked to Inventory via productId.

### Enums:
- **ProductStatus**: "SOLD", "RETURNED", "CREDITED"
- **SaleType**: "DEBIT", "CREDIT"
- **PaymentType**: "CASH", "Mpesa"
- **PeriodType**: "DAY", "WEEK", "MONTH"
- **Status**: "PENDING", "PAID", "RETURNED"
- **CategoryType**: "EXPENSE", "INVENTORY"
- **AssetAccountType**: "CASHACCOUNT", "ACCOUNTRECEIVABLE", "INVENTORYACCOUNT"
- **EquityAccountType**: "CAPITALACCOUNT", "RETAINEDEARNINGS"
- **RevenueAccountType**: "SALESACCOUNT", "SERVICEACCOUNT"
- **WriteOffAccountType**: "DISPOSABLEACCOUNT", "BADDEBT"

# Important Considerations:
- **Date Times**: All DateTime fields are stored in ISO 8601 format (e.g., "YYYY-MM-DDTHH:MM:SSZ"). When filtering by date, ensure your query uses this format and appropriate MongoDB operators ($gte, $lt).
- **Summary Tables**: For summary requests like "total sales last month", prioritize querying SalesSummary, ExpenseSummary, ServiceSummary, LowStockSummary, or CreditedSummary if their periodType and created_at/date fields match the user's request. Only resort to aggregating raw transaction tables (Sales, Expenses, Services) for more granular or custom aggregations not covered by summaries.
- **Relationships / Joins**: Use the $lookup aggregation stage for queries that require joining data across collections (e.g., getting product names from Inventory when querying Sales).
`

const PYMONGO_OUTPUT_FORMAT_INSTRUCTIONS = `
# Expected Output Format:
Your output MUST be a valid Python dictionary string. This dictionary will be directly used to execute a MongoDB query using PyMongo.

## For find operations:
{{\"collection\": \"CollectionName\", \"operation\": \"find\", \"query\": {{...}}, \"projection\": {{...}}, \"sort\": {{...}}, \"limit\": int}}
- collection (str): The name of the MongoDB collection (Prisma Model name).
- operation (str): Must be \"find\".
- query (dict, optional): MongoDB query document (e.g., {{\"field\": \"value\"}}, {{\"field\": {{\"$gt\": 10}}}}). Use standard MongoDB operators ($eq, $gt, $lt, $gte, $lte, $in, $regex, $expr).
- projection (dict, optional): MongoDB projection document (e.g., {{\"fieldName\": 1, \"_id\": 0}}).
- sort (dict, optional): MongoDB sort document (e.g., {{\"fieldName\": 1}} for ascending, {{\"fieldName\": -1}} for descending).
- limit (int, optional): Maximum number of documents to return.

## For aggregate operations:
{{\"collection\": \"CollectionName\", \"operation\": \"aggregate\", \"pipeline\": [...]}}
- collection (str): The name of the MongoDB collection (Prisma Model name).
- operation (str): Must be \"aggregate\".
- pipeline (list): A list of MongoDB aggregation pipeline stages (e.g., {{\"$match\": {{}}}}, {{\"$group\": {{}}}}, {{\"$lookup\": {{}}}}, {{\"$sort\": {{}}}}, {{\"$limit\": int}}, {{\"$project\": {{}}}}, {{\"$unwind\": {{}}}}).

# Strict Rules for Query Generation:
- **READ-ONLY**: Only generate queries for reading data (find or aggregate). DO NOT generate any write operations (insert, update, delete).
- **VALID PYMONGO**: Ensure the output is a syntactically correct Python dictionary that represents a PyMongo query.
- **FIELD NAMES**: Always use the exact field names as defined in the schema.
- **DATE FORMAT**: For all date filters, use ISO 8601 format (e.g., "YYYY-MM-DDTHH:MM:SSZ"). Compute dynamic dates (today, yesterday, last_month_start, etc.) using the provided {{date_variable}} placeholders in your prompt.
- **AGGREGATIONS**:
    - Use $sum, $avg, $min, $max, $count within $group stages.
    - Use $lookup for joins between related collections.
    - Use $unwind after $lookup if the relation can return multiple documents and you want one document per joined item.
- **SUMMARIES**: When a query asks for high-level summaries (e.g., "total sales for last month"), first check if SalesSummary, ExpenseSummary, ServiceSummary, LowStockSummary, or CreditedSummary can provide the information. If so, query the relevant summary table using periodType and created_at/date fields. Only resort to aggregating raw transaction tables (Sales, Expenses, Services) for more granular or custom aggregations not covered by summaries.
- **DO NOT EXPLAIN**: Provide only the Python dictionary output. Do not include any explanations or conversational text in your response.
`

// Corrected FEW_SHOT_EXAMPLES to be a valid JSON array string
const FEW_SHOT_EXAMPLES = `
### User:
List all inventory items.

### MongoDB Query:
db.Inventory.find({})

---

### User:
Show me products with quantity less than 10.

### MongoDB Query:
db.Inventory.find({ quantity: { $lt: 10 } })

---

### User:
What are the names and prices of all Electronics products?

### MongoDB Query:
db.Inventory.aggregate([
  {
    $lookup: {
      from: "Category",
      localField: "categoryId",
      foreignField: "id",
      as: "categoryInfo"
    }
  },
  { $unwind: "$categoryInfo" },
  { $match: { "categoryInfo.name": "Electronics" } },
  { $project: { _id: 0, name: 1, price: 1 } }
])

---

### User:
What was the total profit from sales last month?

### MongoDB Query:
db.SalesSummary.find({
  periodType: "MONTH",
  created_at: {
    $gte: "{{last_month_start}}",
    $lte: "{{last_month_end}}"
  }
}, { totalProfit: 1, _id: 0 })

---

### User:
How many sales transactions happened yesterday?

### MongoDB Query:
db.Sales.aggregate([
  {
    $match: {
      created_at: {
        $gte: "{{yesterday_start}}",
        $lt: "{{today_start}}"
      }
    }
  },
  { $count: "totalTransactions" }
])

---

### User:
List the top 3 highest-priced items in Inventory.

### MongoDB Query:
db.Inventory.find({}, { _id: 0, name: 1, price: 1 }).sort({ price: -1 }).limit(3)

---

### User:
What are the total debit and credit amounts recorded in the AssetAccount for 'INVENTORYACCOUNT'?

### MongoDB Query:
db.AssetAccount.aggregate([
  { $match: { accounttype: "INVENTORYACCOUNT" } },
  {
    $group: {
      _id: null,
      totalDebits: { $sum: "$debitTotal" },
      totalCredits: { $sum: "$creditTotal" }
    }
  },
  { $project: { _id: 0, totalDebits: 1, totalCredits: 1 } }
])

---

### User:
Show me all credited summaries that are still pending.

### MongoDB Query:
db.CreditedSummary.find({ status: "PENDING" })

---

### User:
Which products are currently below their stock threshold?

### MongoDB Query:
db.Inventory.find({
  $expr: { $lt: ["$quantity", "$threshold"] }
})

---

### User:
What was the total revenue generated from services in the last 7 days?

### MongoDB Query:
db.Services.aggregate([
  {
    $match: {
      created_at: {
        $gte: "{{last_7_days_start}}",
        $lt: "{{now}}"
      }
    }
  },
  {
    $group: {
      _id: null,
      totalServiceRevenue: { $sum: "$price" }
    }
  },
  { $project: { _id: 0, totalServiceRevenue: 1 } }
])

---

### User:
List the names of all expense categories.

### MongoDB Query:
db.Category.find({ type: "EXPENSE" }, { _id: 0, name: 1 })

---

### User:
What is the current cash balance?

### MongoDB Query:
db.CASHBALANCE.find({}, { _id: 0, amount: 1 }).sort({ created_at: -1 }).limit(1)

---

### User:
Show me all sales made by the user 'user123'.

### MongoDB Query:
db.Sales.find({ kindeId: "user123" })

---

### User:
What was the total amount of all expenses?

### MongoDB Query:
db.Expenses.aggregate([
  {
    $group: {
      _id: null,
      totalExpensesAmount: { $sum: "$amount" }
    }
  },
  { $project: { _id: 0, totalExpensesAmount: 1 } }
])
`;


export const LLM_PROMPT_TEMPLATE_ESCAPED = `

${PRISMA_SCHEMA_FOR_LLM}

${PYMONGO_OUTPUT_FORMAT_INSTRUCTIONS}

${FEW_SHOT_EXAMPLES}

# Only use these allowed placeholders for dates:
# {yesterday_start}, {today_start}, {last_month_start}, {last_month_end}, {last_7_days_start}, {now}
# For specific dates like "June 6th, 2025", convert the date to ISO format and use:
# {YYYY-MM-DD_start} and {YYYY-MM-DD_end}
# Do NOT create custom placeholders. These will cause failures.
# Always use the full ISO format (YYYY-MM-DD).

# ⚠️ IMPORTANT:
# Step 1: Check if the user query is related to the schema.
# Step 2: If it is related, respond ONLY with a valid PyMongo JSON query (no extra text or explanation).
# Step 3: If it is NOT related to the schema, respond with the following JSON error object including the available schema:

# {
#   "error": "The query is not related to the available schema. I can only answer questions based on the schema below.",
#   "available_schema": "<INSERT CURRENTLY AVAILABLE  SUMMARY OF THE TABLES IN THE SCHEMA HERE>"
# }

# The schema must be included in the "available_schema" field as a string.

Now, convert the following natural language query into an executable PyMongo Query.
User Query: {user_query}

PyMongo Query (Only valid JSON or the JSON error object, nothing else):
`


// Import the prompt template from the prompt file
export const promptTemplate = PromptTemplate.fromTemplate(LLM_PROMPT_TEMPLATE_ESCAPED);

