"use client";

import {type FormEvent, useId, useMemo, useRef, useState} from "react";
import type {HomeLanguage} from "@/features/home/copy";
import {localeDirection} from "@/i18n/locales";
import {countries, getCountryName} from "./countries";
import {votingCopy} from "./copy";
import {votingNumber} from "./format";
import {
    characterCount,
    MAX_CONTRIBUTIONS,
    MAX_NOMINATION_REASON,
    MAX_NOMINEE_LINKS,
    type NominationDraft,
    type NominationError,
    validateNominationDraft,
} from "./nomination-validation";
import {getProfileCopy} from "./profile-copy";
import "./nomination-form.css";

type TextField =
  "firstName" | "lastName" | "city" | "activity" | "nominatorName";
type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface NominationFormProps {
  readonly language: HomeLanguage;
  readonly value: NominationDraft;
  readonly onChange: (draft: NominationDraft) => void;
  readonly onReview: (draft: NominationDraft) => void;
}

/** A controlled draft. Review validates locally; it never publishes a nomination. */
export function NominationForm({
  language,
  value,
  onChange,
  onReview,
}: NominationFormProps) {
  const copy = votingCopy[language];
  const profileCopy = getProfileCopy(language);
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, NominationError>>({});
  const orderedCountries = useMemo(
    () =>
      [...countries].sort((a, b) =>
        getCountryName(a.code, language).localeCompare(
          getCountryName(b.code, language),
          language,
        ),
      ),
    [language],
  );
  const fieldId = (name: string) => `${id}-${name.replaceAll(".", "-")}`;
  const errorId = (name: string) => `${fieldId(name)}-error`;
  const attributes = (name: string, hint?: string) => ({
    id: fieldId(name),
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby":
      [hint, errors[name] ? errorId(name) : undefined]
        .filter(Boolean)
        .join(" ") || undefined,
  });
  const errorText = (name: string) => {
    const error = errors[name];
    return error ? (
      <span className="nomination-form__error" id={errorId(name)}>
        {profileCopy.errors[error]}
      </span>
    ) : null;
  };
  const clearError = (name: string) => {
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
    const control = form.current?.elements.namedItem(name);
    if (
      control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement ||
      control instanceof HTMLSelectElement
    )
      control.setCustomValidity("");
  };
  const clearGroupErrors = (group: "contributions" | "links") => {
    setErrors((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(
          ([name]) => name !== group && !name.startsWith(`${group}.`),
        ),
      ),
    );
    form.current
      ?.querySelectorAll<FormControl>(`[name^="${group}."]`)
      .forEach((control) => control.setCustomValidity(""));
  };
  const focusControl = (control: HTMLElement | null) => {
    if (!control) return;
    control.focus({ preventScroll: true });
    const panel = control.closest<HTMLElement>(".voting-panel");
    if (!panel) return;
    const box = control.getBoundingClientRect(),
      frame = panel.getBoundingClientRect();
    if (box.top < frame.top + 60 || box.bottom > frame.bottom - 24) {
      panel.scrollTo({
        top: panel.scrollTop + box.top - frame.top - 60,
        behavior: "instant",
      });
    }
  };
  const focusField = (name: string) => {
    requestAnimationFrame(() => {
      const control = form.current?.elements.namedItem(name);
      if (control instanceof HTMLElement) focusControl(control);
    });
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateNominationDraft(value);
    const nextErrors = result.success ? {} : result.errors;
    setErrors(nextErrors);
    for (const control of Array.from(event.currentTarget.elements)) {
      if (
        control instanceof HTMLInputElement ||
        control instanceof HTMLTextAreaElement ||
        control instanceof HTMLSelectElement
      ) {
        const error = nextErrors[control.name];
        control.setCustomValidity(error ? profileCopy.errors[error] : "");
      }
    }
    if (result.success) {
      onReview(result.data);
      return;
    }
    // Use DOM order rather than validation-map order, including dynamic fields.
    const invalid = event.currentTarget.querySelector<FormControl>(
      "input:invalid, select:invalid, textarea:invalid",
    );
    focusControl(invalid);
  };
  const textField = (name: TextField, label: string) => (
    <div className="nomination-form__field" key={name}>
      <label htmlFor={fieldId(name)}>{label}</label>
      <input
        {...attributes(name)}
        dir="auto"
        required
        autoComplete="off"
        value={value[name]}
        onChange={(event) => onChange({ ...value, [name]: event.target.value })}
      />
      {errorText(name)}
    </div>
  );
  const reasonCount = characterCount(value.reason.trim().normalize("NFC"));

  return (
    <form
      ref={form}
      className="voting-nomination nomination-form"
      noValidate
      onSubmit={submit}
      onInput={(event) => {
        const control = event.target;
        if (
          control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement ||
          control instanceof HTMLSelectElement
        )
          clearError(control.name);
      }}
    >
      <p className="nomination-form__intro">{copy.nominateIntro}</p>
      <div className="nomination-form__grid">
        {textField("firstName", copy.firstName)}
        {textField("lastName", copy.lastName)}
        <div className="nomination-form__field">
          <label htmlFor={fieldId("country")}>{copy.country}</label>
          <select
            {...attributes("country")}
            required
            value={value.country}
            onChange={(event) => {
              clearError("country");
              onChange({ ...value, country: event.target.value });
            }}
          >
            <option value="">{copy.requiredCountry}</option>
            {orderedCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {getCountryName(country.code, language)}
              </option>
            ))}
          </select>
          {errorText("country")}
        </div>
        {textField("city", profileCopy.city)}
        <div className="nomination-form__wide">
          {textField("activity", copy.occupation)}
        </div>
        <div className="nomination-form__field nomination-form__wide">
          <label htmlFor={fieldId("reason")}>{copy.nominationReason}</label>
          <textarea
            {...attributes("reason", `${id}-reason-hint`)}
            dir="auto"
            required
            rows={7}
            value={value.reason}
            onChange={(event) =>
              onChange({ ...value, reason: event.target.value })
            }
          />
          <div className="nomination-form__hint-row">
            <span id={`${id}-reason-hint`}>{profileCopy.reasonHint}</span>
            <span
              className="nomination-form__counter"
              data-over-limit={reasonCount > MAX_NOMINATION_REASON}
            >
              {votingNumber(reasonCount, language)} /{" "}
              {votingNumber(MAX_NOMINATION_REASON, language)}
            </span>
          </div>
          {errorText("reason")}
        </div>
      </div>

      <section
        className="nomination-form__section"
        aria-labelledby={`${id}-contributions-title`}
      >
        <div className="nomination-form__section-heading">
          <h4 id={`${id}-contributions-title`}>{profileCopy.contributions}</h4>
          <span>{profileCopy.optional}</span>
        </div>
        <p>{profileCopy.contributionsHint}</p>
        <div className="nomination-form__entries">
          {value.contributions.map((entry, index) => {
            const prefix = `contributions.${index}`;
            return (
              <fieldset className="nomination-form__entry" key={index}>
                <legend>
                  {profileCopy.contributions}{" "}
                  {votingNumber(index + 1, language)}
                </legend>
                <button
                  className="nomination-form__remove"
                  type="button"
                  aria-label={`${profileCopy.removeContribution} ${votingNumber(index + 1, language)}`}
                  onClick={() => {
                    clearGroupErrors("contributions");
                    onChange({
                      ...value,
                      contributions: value.contributions.filter(
                        (_, item) => item !== index,
                      ),
                    });
                    requestAnimationFrame(() =>
                      focusControl(
                        document.getElementById(`${id}-add-contribution`),
                      ),
                    );
                  }}
                >
                  <span aria-hidden="true">×</span>
                </button>
                <div className="nomination-form__grid">
                  <div className="nomination-form__field nomination-form__wide">
                    <label htmlFor={fieldId(`${prefix}.what`)}>
                      {profileCopy.contributionDescription}
                    </label>
                    <textarea
                      {...attributes(`${prefix}.what`)}
                      dir="auto"
                      required
                      rows={3}
                      value={entry.what}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          contributions: value.contributions.map(
                            (item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, what: event.target.value }
                                : item,
                          ),
                        })
                      }
                    />
                    {errorText(`${prefix}.what`)}
                  </div>
                  <div className="nomination-form__field">
                    <label htmlFor={fieldId(`${prefix}.when`)}>
                      {profileCopy.contributionDate}
                    </label>
                    <input
                      {...attributes(`${prefix}.when`)}
                      type="date"
                      dir="ltr"
                      required
                      value={entry.when}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          contributions: value.contributions.map(
                            (item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, when: event.target.value }
                                : item,
                          ),
                        })
                      }
                    />
                    {errorText(`${prefix}.when`)}
                  </div>
                  <div className="nomination-form__field">
                    <label htmlFor={fieldId(`${prefix}.forWhom`)}>
                      {profileCopy.contributionBeneficiaries}
                    </label>
                    <input
                      {...attributes(`${prefix}.forWhom`)}
                      dir="auto"
                      required
                      value={entry.forWhom}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          contributions: value.contributions.map(
                            (item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, forWhom: event.target.value }
                                : item,
                          ),
                        })
                      }
                    />
                    {errorText(`${prefix}.forWhom`)}
                  </div>
                </div>
              </fieldset>
            );
          })}
        </div>
        {errorText("contributions")}
        <button
          id={`${id}-add-contribution`}
          className="nomination-form__add"
          type="button"
          disabled={value.contributions.length >= MAX_CONTRIBUTIONS}
          onClick={() => {
            onChange({
              ...value,
              contributions: [
                ...value.contributions,
                { what: "", when: "", forWhom: "" },
              ],
            });
            focusField(`contributions.${value.contributions.length}.what`);
          }}
        >
          <span aria-hidden="true">+</span> {profileCopy.addContribution}
          <span className="nomination-form__limit">
            {votingNumber(value.contributions.length, language)} /{" "}
            {votingNumber(MAX_CONTRIBUTIONS, language)}
          </span>
        </button>
      </section>

      <section
        className="nomination-form__section"
        aria-labelledby={`${id}-links-title`}
      >
        <div className="nomination-form__section-heading">
          <h4 id={`${id}-links-title`}>{profileCopy.links}</h4>
          <span>{profileCopy.optional}</span>
        </div>
        <p>{profileCopy.linksHint}</p>
        <div className="nomination-form__entries">
          {value.links.map((entry, index) => {
            const prefix = `links.${index}`;
            return (
              <fieldset className="nomination-form__entry" key={index}>
                <legend>
                  {profileCopy.links} {votingNumber(index + 1, language)}
                </legend>
                <button
                  className="nomination-form__remove"
                  type="button"
                  aria-label={`${profileCopy.removeLink} ${votingNumber(index + 1, language)}`}
                  onClick={() => {
                    clearGroupErrors("links");
                    onChange({
                      ...value,
                      links: value.links.filter((_, item) => item !== index),
                    });
                    requestAnimationFrame(() =>
                      focusControl(document.getElementById(`${id}-add-link`)),
                    );
                  }}
                >
                  <span aria-hidden="true">×</span>
                </button>
                <div className="nomination-form__grid">
                  <div className="nomination-form__field">
                    <label htmlFor={fieldId(`${prefix}.label`)}>
                      {profileCopy.linkLabel}
                    </label>
                    <input
                      {...attributes(`${prefix}.label`)}
                      dir="auto"
                      required
                      value={entry.label}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          links: value.links.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, label: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                    {errorText(`${prefix}.label`)}
                  </div>
                  <div className="nomination-form__field">
                    <label htmlFor={fieldId(`${prefix}.url`)}>
                      {profileCopy.linkUrl}
                    </label>
                    <input
                      {...attributes(`${prefix}.url`)}
                      type="url"
                      dir="ltr"
                      required
                      placeholder="https://"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={entry.url}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          links: value.links.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, url: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                    {errorText(`${prefix}.url`)}
                  </div>
                </div>
              </fieldset>
            );
          })}
        </div>
        {errorText("links")}
        <button
          id={`${id}-add-link`}
          className="nomination-form__add"
          type="button"
          disabled={value.links.length >= MAX_NOMINEE_LINKS}
          onClick={() => {
            onChange({
              ...value,
              links: [...value.links, { label: "", url: "" }],
            });
            focusField(`links.${value.links.length}.label`);
          }}
        >
          <span aria-hidden="true">+</span> {profileCopy.addLink}
          <span className="nomination-form__limit">
            {votingNumber(value.links.length, language)} /{" "}
            {votingNumber(MAX_NOMINEE_LINKS, language)}
          </span>
        </button>
      </section>

      <section className="nomination-form__consent">
        <label
          className="nomination-form__check"
          htmlFor={fieldId("showNominator")}
        >
          <input
            id={fieldId("showNominator")}
            name="showNominator"
            type="checkbox"
            checked={value.showNominator}
            onChange={(event) => {
              clearError("nominatorName");
              onChange({
                ...value,
                showNominator: event.target.checked,
                nominatorName: event.target.checked ? value.nominatorName : "",
              });
            }}
          />
          <span>{profileCopy.consentLabel}</span>
        </label>
        {value.showNominator
          ? textField("nominatorName", profileCopy.nominatorName)
          : null}
      </section>
      <button className="voting-solid nomination-form__review" type="submit">
        {copy.review}
        <span aria-hidden="true">
          {localeDirection(language) === "rtl" ? "←" : "→"}
        </span>
      </button>
    </form>
  );
}
