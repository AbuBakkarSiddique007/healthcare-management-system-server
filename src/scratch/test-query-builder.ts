/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryBuilder } from "../app/utils/QueryBuilder";
import { doctorFilterableFields, doctorSearchableFields } from "../app/module/doctor/doctor.constant";

// Mock Prisma model delegate
const mockModel = {
    findMany: async (args: any) => [],
    count: async (args: any) => 0
};

function testSearch() {
    console.log("--- Testing Search ---");
    const query = { searchTerm: "cardiology" };
    const qb = new QueryBuilder(mockModel as any, query, {
        searchableFields: doctorSearchableFields
    });
    
    qb.search();
    console.log("Search Query:", JSON.stringify(qb.getQuery().where, null, 2));
}

function testFilter() {
    console.log("\n--- Testing Filter ---");
    const query = { 
        gender: "MALE",
        appointmentFee: { gt: "100" },
        "user.age": { gt: "20" },
        "user.role": "DOCTOR",
        "specialties.specialty.title": "Cardiology"
    };
    const qb = new QueryBuilder(mockModel as any, query as any, {
        filterableFields: [...doctorFilterableFields, "user.age"]
    });
    
    qb.filter();
    console.log("Filter Query:", JSON.stringify(qb.getQuery().where, null, 2));
}

function testSortAndPaginate() {
    console.log("\n--- Testing Sort & Paginate ---");
    const query = { 
        page: "2",
        limit: "5",
        sortBy: "user.name",
        sortOrder: "asc"
    };
    const qb = new QueryBuilder(mockModel as any, query as any);
    
    qb.paginate().sort();
    const result = qb.getQuery();
    console.log("Pagination:", { skip: result.skip, take: result.take });
    console.log("Sort:", JSON.stringify(result.orderBy, null, 2));
}

testSearch();
testFilter();
testSortAndPaginate();
