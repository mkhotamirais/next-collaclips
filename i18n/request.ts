import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
// import { cookies } from "next/headers";

export default getRequestConfig(async ({ locale }) => {
  //   const store = await cookies();
  //   const locale = store.get("locale")?.value || "id";

  if (!locale) {
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    } else {
      notFound();
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // messages: {
    //   main: (await import(`../messages/${locale}/main.json`)).default,
    //   home: (await import(`../messages/${locale}/home.json`)).default,
    // },
  };
});
