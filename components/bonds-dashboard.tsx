"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  RefreshCcw,
  Percent,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BondRow = {
  figi: string;
  instrumentUid: string;
  ticker: string;
  classCode: string;
  name: string;
  quantity: number | null;
  nominal: number | null;
  price: number | null;
  nkd: number | null;
  couponAmount: number | null;
  remainingCouponCount: number;
  lastCouponOrMaturityDate: string | null;
  bankCommission: number | null;
  grossAnnualYieldPercent: number | null;
  tax: number | null;
  netAnnualIncomeRub: number | null;
  netYieldPercent: number | null;
  currency: string;
  maturityDate: string | null;
  daysToMaturity: number | null;
  totalCouponIncome: number | null;
  couponCountCalculation: string;
};

type FiltersResponse = {
  maturityDateFrom: string | null;
  maturityDateTo: string | null;
  riskLevel: string;
  amortization: string;
  currency: string;
  couponType: string;
};

type BondsResponse = {
  source: string;
  market: string;
  universeFetchedAt: string | null;
  fetchedAt: string;
  count: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  filters: FiltersResponse;
  bonds: BondRow[];
};

type FiltersState = {
  maturityDateFrom: string;
  maturityDateTo: string;
  riskLevel: string;
  amortization: string;
  currency: string;
  couponType: string;
};

type SortField =
  | "maturityDate"
  | "price"
  | "grossAnnualYieldPercent"
  | "netYieldPercent";
type SortDirection = "asc" | "desc";
type SortState = {
  field: SortField;
  direction: SortDirection;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";
const PAGE_SIZE = 20;
const DEFAULT_SORT: SortState = {
  field: "maturityDate",
  direction: "asc",
};

const rubFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createDefaultFilters(): FiltersState {
  const today = new Date();
  const tenYearsLater = new Date(today);
  tenYearsLater.setFullYear(today.getFullYear() + 10);

  return {
    maturityDateFrom: toInputDate(today),
    maturityDateTo: toInputDate(tenYearsLater),
    riskLevel: "all",
    amortization: "all",
    currency: "rub",
    couponType: "all",
  };
}

function formatMoney(value: number | null) {
  if (value === null) {
    return "—";
  }

  return rubFormatter.format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${percentFormatter.format(value)}%`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return dateFormatter.format(new Date(value));
}

function resolveYieldTone(value: number | null) {
  if (value === null) {
    return "text-muted-foreground";
  }

  if (value > 0) {
    return "text-emerald-700";
  }

  if (value < 0) {
    return "text-rose-700";
  }

  return "text-foreground";
}

function compareNullableNumbers(left: number | null, right: number | null) {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return left - right;
}

function compareNullableDates(left: string | null, right: string | null) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return new Date(left).getTime() - new Date(right).getTime();
}

function sortBonds(bonds: BondRow[], sortState: SortState) {
  const sorted = [...bonds];

  sorted.sort((left, right) => {
    let result = 0;

    switch (sortState.field) {
      case "maturityDate":
        result = compareNullableDates(left.maturityDate, right.maturityDate);
        break;
      case "price":
        result = compareNullableNumbers(left.price, right.price);
        break;
      case "grossAnnualYieldPercent":
        result = compareNullableNumbers(
          left.grossAnnualYieldPercent,
          right.grossAnnualYieldPercent,
        );
        break;
      case "netYieldPercent":
        result = compareNullableNumbers(
          left.netYieldPercent,
          right.netYieldPercent,
        );
        break;
      default:
        result = 0;
    }

    if (result === 0) {
      result = left.ticker.localeCompare(right.ticker);
    }

    return sortState.direction === "asc" ? result : result * -1;
  });

  return sorted;
}

function SortIndicator({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return <ArrowUpDown className="size-3.5 opacity-55" />;
  }

  return direction === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

function SortableHeader({
  label,
  field,
  sortState,
  onSort,
}: {
  label: string;
  field: SortField;
  sortState: SortState;
  onSort: (field: SortField) => void;
}) {
  const isActive = sortState.field === field;

  return (
    <TableHead>
      <button
        className="inline-flex items-center gap-1.5 text-left transition-colors hover:text-foreground"
        onClick={() => onSort(field)}
        type="button"
      >
        <span>{label}</span>
        <SortIndicator
          active={isActive}
          direction={isActive ? sortState.direction : "asc"}
        />
      </button>
    </TableHead>
  );
}

export function BondsDashboard() {
  const defaultFilters = createDefaultFilters();
  const [data, setData] = useState<BondsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT);
  const [draftFilters, setDraftFilters] = useState<FiltersState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersState>(defaultFilters);

  const bonds = data?.bonds ?? [];
  const sortedBonds = sortBonds(bonds, sortState);
  const averageNetYield =
    bonds.length > 0
      ? bonds.reduce((sum, bond) => sum + (bond.netYieldPercent ?? 0), 0) /
        bonds.length
      : null;
  const totalNetIncome =
    bonds.length > 0
      ? bonds.reduce((sum, bond) => sum + (bond.netAnnualIncomeRub ?? 0), 0)
      : null;
  const profitableBonds = bonds.filter((bond) => (bond.netYieldPercent ?? 0) > 0)
    .length;

  async function fetchBonds(page: number, filters: FiltersState) {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        maturityDateFrom: filters.maturityDateFrom,
        maturityDateTo: filters.maturityDateTo,
        riskLevel: filters.riskLevel,
        amortization: filters.amortization,
        currency: filters.currency,
        couponType: filters.couponType,
      });

      const response = await fetch(`${API_BASE_URL}/api/bonds?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as BondsResponse & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Не удалось обновить данные.");
      }

      setData(payload);
      setAppliedFilters(filters);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось получить данные от сервера.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleRefresh() {
    void fetchBonds(1, draftFilters);
  }

  function handleResetFilters() {
    const nextFilters = createDefaultFilters();
    setDraftFilters(nextFilters);
    void fetchBonds(1, nextFilters);
  }

  function handlePreviousPage() {
    if (!data || data.page <= 1) {
      return;
    }

    void fetchBonds(data.page - 1, appliedFilters);
  }

  function handleNextPage() {
    if (!data || data.page >= data.totalPages) {
      return;
    }

    void fetchBonds(data.page + 1, appliedFilters);
  }

  function handleSort(field: SortField) {
    setSortState((current) => {
      if (current.field === field) {
        return {
          field,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        field,
        direction: "asc",
      };
    });
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge tone="warning">T-Bank market monitor</Badge>
              <div className="space-y-3">
                <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Доходность облигаций по рынку, с фильтрами и сортировкой.
                </h2>
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                  Бэкенд получает весь список торгуемых облигаций, применяет
                  фильтры до пагинации и считает только текущую страницу по 20
                  бумагам. Клики по заголовкам меняют порядок строк внутри
                  текущей страницы без лишнего запроса к API.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {data ? (
                <p className="text-xs text-muted-foreground">
                  Последнее обновление: {formatDate(data.fetchedAt)}{" "}
                  {new Date(data.fetchedAt).toLocaleTimeString("ru-RU")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Данные загрузятся после первого запроса.
                </p>
              )}
              <Button onClick={handleRefresh} disabled={isLoading}>
                <RefreshCcw
                  className={isLoading ? "size-4 animate-spin" : "size-4"}
                />
                {isLoading ? "Обновляем..." : "Обновить данные"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Риск
              </span>
              <Select
                value={draftFilters.riskLevel}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    riskLevel: event.target.value,
                  }))
                }
              >
                <option value="all">Все уровни риска</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </Select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Погашение от
              </span>
              <Input
                type="date"
                value={draftFilters.maturityDateFrom}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    maturityDateFrom: event.target.value,
                  }))
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Погашение до
              </span>
              <Input
                type="date"
                value={draftFilters.maturityDateTo}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    maturityDateTo: event.target.value,
                  }))
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Амортизация
              </span>
              <Select
                value={draftFilters.amortization}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    amortization: event.target.value,
                  }))
                }
              >
                <option value="all">Есть и нет</option>
                <option value="yes">Есть</option>
                <option value="no">Нет</option>
              </Select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Валюта
              </span>
              <Select
                value={draftFilters.currency}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    currency: event.target.value,
                  }))
                }
              >
                <option value="rub">Рубли</option>
                <option value="all">Все валюты</option>
                <option value="cny">Юани</option>
                <option value="usd">Доллары</option>
                <option value="eur">Евро</option>
              </Select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Купон
              </span>
              <Select
                value={draftFilters.couponType}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    couponType: event.target.value,
                  }))
                }
              >
                <option value="all">Любой купон</option>
                <option value="fixed">Фикс</option>
                <option value="floating">Плавающий</option>
              </Select>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
              <CalendarRange className="size-4" />
              Применить фильтры
            </Button>
            <Button variant="ghost" onClick={handleResetFilters} disabled={isLoading}>
              Сбросить к дефолтам
            </Button>
          </div>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/80">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ReceiptText className="size-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">
                    Найдено облигаций
                  </span>
                </div>
                <p className="text-3xl font-semibold text-foreground">
                  {data?.totalCount ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  На странице: {data?.count ?? 0} из {PAGE_SIZE}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="size-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">
                    Ср. чистая доходность
                  </span>
                </div>
                <p
                  className={`text-3xl font-semibold ${resolveYieldTone(
                    averageNetYield,
                  )}`}
                >
                  {formatPercent(averageNetYield)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Положительных бумаг на странице: {profitableBonds}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Percent className="size-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">
                    Суммарный чистый доход
                  </span>
                </div>
                <p
                  className={`text-3xl font-semibold ${resolveYieldTone(
                    totalNetIncome,
                  )}`}
                >
                  {formatMoney(totalNetIncome)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Валюта фильтра: {draftFilters.currency.toUpperCase()}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Облигация</TableHead>
                <TableHead>Номинал</TableHead>
                <SortableHeader
                  label="Стоимость"
                  field="price"
                  sortState={sortState}
                  onSort={handleSort}
                />
                <TableHead>НКД</TableHead>
                <TableHead>Купон</TableHead>
                <TableHead>Ост. купоны</TableHead>
                <SortableHeader
                  label="Дата погашения"
                  field="maturityDate"
                  sortState={sortState}
                  onSort={handleSort}
                />
                <TableHead>Комиссия</TableHead>
                <SortableHeader
                  label="Доходность"
                  field="grossAnnualYieldPercent"
                  sortState={sortState}
                  onSort={handleSort}
                />
                <TableHead>Налог</TableHead>
                <TableHead>Чистый доход</TableHead>
                <SortableHeader
                  label="Чистая доходность"
                  field="netYieldPercent"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBonds.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                    colSpan={12}
                  >
                    Нажми «Обновить данные» или скорректируй фильтры, чтобы
                    загрузить страницу облигаций.
                  </TableCell>
                </TableRow>
              ) : null}

              {sortedBonds.map((bond) => (
                <TableRow key={bond.instrumentUid}>
                  <TableCell className="min-w-64">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{bond.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{bond.ticker}</span>
                        <span>{bond.classCode}</span>
                        <span>{bond.currency.toUpperCase()}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {formatMoney(bond.nominal)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {formatMoney(bond.price)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {formatMoney(bond.nkd)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {formatMoney(bond.couponAmount)}
                  </TableCell>
                  <TableCell>{bond.remainingCouponCount}</TableCell>
                  <TableCell>{formatDate(bond.maturityDate)}</TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {formatMoney(bond.bankCommission)}
                  </TableCell>
                  <TableCell
                    className={`font-mono text-xs sm:text-sm ${resolveYieldTone(
                      bond.grossAnnualYieldPercent,
                    )}`}
                  >
                    {formatPercent(bond.grossAnnualYieldPercent)}
                  </TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {formatMoney(bond.tax)}
                  </TableCell>
                  <TableCell
                    className={`font-mono text-xs sm:text-sm ${resolveYieldTone(
                      bond.netAnnualIncomeRub,
                    )}`}
                  >
                    {formatMoney(bond.netAnnualIncomeRub)}
                  </TableCell>
                  <TableCell
                    className={`font-mono text-xs sm:text-sm ${resolveYieldTone(
                      bond.netYieldPercent,
                    )}`}
                  >
                    {formatPercent(bond.netYieldPercent)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted-foreground">
              {data
                ? `Страница ${data.page} из ${data.totalPages || 1}. Дата: ${
                    data.filters.maturityDateFrom || "—"
                  } — ${data.filters.maturityDateTo || "—"}`
                : "Пока нет активной страницы."}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePreviousPage}
                disabled={isLoading || !data || data.page <= 1}
              >
                <ChevronLeft className="size-4" />
                Назад
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNextPage}
                disabled={isLoading || !data || data.page >= data.totalPages}
              >
                Вперёд
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs leading-6 text-muted-foreground">
        Дефолты у фильтров уже выставлены: валюта по умолчанию `RUB`, диапазон
        дат заполнен, а дополнительные селекты не остаются пустыми. Сортировка
        по клику работает для текущей страницы из 20 строк.
      </p>
    </div>
  );
}
