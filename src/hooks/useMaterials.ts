import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "@/lib/graphql-client";
import {
  GET_MATERIAL_CATEGORIES_QUERY,
  DEFAULT_MATERIAL_CATEGORIES_VARIABLES,
  GetMaterialCategoriesResponse,
  MaterialCategory,
} from "../graphql/materials";

export function useMaterialCategories() {
  return useQuery({
    queryKey: ["materialCategories"],
    queryFn: () =>
      graphqlRequest<GetMaterialCategoriesResponse>(
        GET_MATERIAL_CATEGORIES_QUERY,
        DEFAULT_MATERIAL_CATEGORIES_VARIABLES,
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Filter out inactive categories (but Keep 'exam' now)
      const categories = data.material_categories.filter(
        (cat) => cat.is_active,
      );

      // Calculate total materials count
      const totalCount = categories.reduce(
        (sum, cat) => sum + cat.materials.length,
        0,
      );

      // Add "All" category at the beginning
      const allCategory: MaterialCategory = {
        id: "all",
        code: "all",
        name: "Tất cả",
        is_active: true,
        materials: categories.flatMap((cat) => cat.materials),
      };

      return {
        categories: [allCategory, ...categories],
        totalCount,
      };
    },
  });
}

export function useMaterialsByCategory(categoryCode: string) {
  const { data, ...rest } = useMaterialCategories();

  const materials =
    categoryCode === "all"
      ? data?.categories.find((c) => c.code === "all")?.materials || []
      : data?.categories.find((c) => c.code === categoryCode)?.materials || [];

  return {
    materials,
    ...rest,
  };
}
