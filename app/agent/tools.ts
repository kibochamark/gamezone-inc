// import { z } from "zod";
// import { tool, StructuredTool } from "@langchain/core/tools";
// import { MongoClient, Db, Collection } from 'mongodb';
// import { promptTemplate } from "./prompt";
// import { RunnableSequence } from "@langchain/core/runnables";

// import { model_gemini, replacePlaceholders } from "./helpers";
// import { connectToCluster } from "@/lib/mongoClient";




// /**
//  * Converts natural language query to a PyMongo executable query.
//  * Capable of handling requests for the latest data by inferring sorting based on a date or timestamp field and applying limits.
//  */
// export const naturalLanguageToPyMongo = tool(
//     async ({ user_query }) => {
//         // LangChain's RunnableSequence acts like LLMChain
//         const chain = RunnableSequence.from([
//             promptTemplate,
//             model_gemini,
//             // Add an output parser if the model response needs structured parsing
//             // For this case, we expect raw JSON string from LLM
//         ]);

//         const result = await chain.invoke({
//             user_query,
//             "yesterday_start": "{{yesterday_start}}", // LLM sees the placeholder string
//             "today_start": "{{today_start}}",
//             "last_month_start": "{{last_month_start}}",
//             "last_month_end": "{{last_month_end}}",
//             "last_7_days_start": "{{last_7_days_start}}",
//             "now": "{{now}}",
//             "YYYY-MM-DD_start": "{{YYYY-MM-DD_start}}",
//             "YYYY-MM-DD_end": "{{YYYY-MM-DD_end}}",
//         });

//         // The 'result' from model.invoke is typically a { content: string } object
//         return result.content;
//     },
//     {
//         name: "natural_language_to_pymongo",
//         description: `Converts natural language query to a PyMongo executable query, capable of handling requests for the latest data by inferring sorting based on a date or timestamp field and applying limits.
//             Args: user_query: The user's query in natural language. Returns: A JSON string representing the PyMongo query.`,
//         schema: z.object({
//             user_query: z.string().describe("The user's query in natural language."),
//         })
//     }
// );

// /**
//  * Interface for the parsed PyMongo query object.
//  */
// interface PyMongoParsedQuery {
//     collection: string;
//     operation: "find" | "aggregate";
//     query?: Record<string, any>;
//     projection?: Record<string, any>;
//     sort?: Record<string, 1 | -1>;
//     limit?: number;
//     pipeline?: Array<Record<string, any>>;
// }

// /**
//  * Parses a PyMongo JSON string from LLM, replaces date placeholders, runs the query, and returns the results.
//  */
// export const runPyMongoQuery = tool(
//     async ({ result }) => {
//         let client: MongoClient | undefined;
//         try {
//             // Parse the JSON block (with or without markdown)
//             let jsonString = result.trim();
//             if (jsonString.startsWith("```json")) {
//                 jsonString.slice(jsonString.indexOf('json'), jsonString.length -3);
//                 jsonString = jsonString.trim();
//             }

//             const parsedJson: PyMongoParsedQuery = JSON.parse(jsonString);
//             // Replace date placeholders
//             const finalQuery = replacePlaceholders(parsedJson);

//             console.log("Final PyMongo Query:", finalQuery);

//             // // Connect to MongoDB
//             // // IMPORTANT: Replace with environment variables for production security!
           
//             // client = await connectToCluster(); // Connect to the MongoDB cluster

//             // const db = await client.db("dantech"); // Access the 'dantech' database
//             // const collection = db.collection(finalQuery.collection);

//             // let queryResult: any[] = [];

//             // // Handle operation
//             // const operation = finalQuery.operation;
//             // if (operation === "aggregate") {
//             //     if (!finalQuery.pipeline) {
//             //         throw new Error("Aggregate operation requires a 'pipeline' array.");
//             //     }
//             //     queryResult = await collection.aggregate(finalQuery.pipeline).toArray();
//             // } else if (operation === "find") {
//             //     let cursor = collection.find(finalQuery.query || {}, finalQuery.projection || {});
//             //     if (finalQuery.sort) {
//             //         cursor = cursor.sort(finalQuery.sort);
//             //     }
//             //     if (finalQuery.limit) {
//             //         cursor = cursor.limit(finalQuery.limit);
//             //     }
//             //     queryResult = await cursor.toArray();
//             // } else {
//             //     throw new Error(`Unsupported operation: ${operation}`);
//             // }

//             return JSON.stringify(finalQuery, null, 2); // Return the final query as a JSON string
//         } catch (e: any) {
//             console.error("Error in runPyMongoQuery:", e);
//             if (e instanceof Error) {
//                 return `An error occurred: ${e.message}`;
//             }
//             return `An unknown error occurred: ${String(e)}`;
//         } finally {
//             if (client) {
//                 await client.close();
//             }
//         }
//     },
//     {
//         name: "run_pymongo_query",
//         description: `Parses a PyMongo JSON string from LLM, replaces date placeholders, runs the query, and returns the results.
//                       Args: result: The JSON string representing the PyMongo query. Returns: A JSON string representing the query results or an error message.`,
//         schema: z.object({
//             result: z.string().describe("The JSON string representing the PyMongo query."),
//         })
//     }
// );

// /**
//  * Executes MongoDB queries from natural language instructions.
//  * This tool serves as a high-level wrapper that enables users to perform MongoDB operations
//  * simply by expressing their intent in natural language. It abstracts away the complexity
//  * of query construction and execution by chaining two sub-tools:
//  * 1. `natural_language_to_pymongo`: Converts a plain English question into a structured PyMongo-style JSON query.
//  * 2. `run_pymongo_query`: Takes the generated PyMongo JSON, resolves any dynamic
//  * placeholders, and runs the query against a live MongoDB database.
//  */
// export const naturalLanguageQueryExecutor = tool(
//     async ({ nl_query }) => {
//         try {
//             // Call the natural_language_to_pymongo tool
//             const pymongoQueryString = await naturalLanguageToPyMongo.invoke({ user_query: nl_query });
//             console.log("Generated PyMongo Query String:", pymongoQueryString);

//             // Call the run_pymongo_query tool with the generated query string
//             const pymongoQueryStringStr = typeof pymongoQueryString === "string"
//                 ? pymongoQueryString
//                 : JSON.stringify(pymongoQueryString);
//             const queryResult = await runPyMongoQuery.invoke({ result: pymongoQueryStringStr });
//             console.log("MongoDB Query Result:", queryResult);

//             return queryResult;
//         } catch (e: any) {
//             console.error("Error in naturalLanguageQueryExecutor:", e);
//             if (e instanceof Error) {
//                 return `Error executing natural language query: ${e.message}`;
//             }
//             return `An unknown error occurred during query execution: ${String(e)}`;
//         }
//     },
//     {
//         name: "natural_language_query_executor",
//         description: `Executes MongoDB queries from natural language instructions.
//                       This tool serves as a high-level wrapper that enables users to perform MongoDB operations
//                       simply by expressing their intent in natural language. It abstracts away the complexity
//                       of query construction and execution by chaining two sub-tools:
//                       1. \`natural_language_to_pymongo\`: Converts a plain English question (e.g.,
//                          "Show me all orders from last month") into a structured PyMongo-style JSON query.
//                       2. \`run_pymongo_query\`: Takes the generated PyMongo JSON, resolves any dynamic
//                          placeholders (e.g., \`{{last_month}}\`), and runs the query against a live MongoDB
//                          database. It supports both \`find\` and \`aggregate\` operations.`,
//         schema: z.object({
//             nl_query: z.string().describe("A natural language question or instruction describing the user's data retrieval need."),
//         })
//     }
// );


