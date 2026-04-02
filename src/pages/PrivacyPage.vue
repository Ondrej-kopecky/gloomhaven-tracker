<script setup lang="ts">
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <div class="gh-page-header">
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Ochrana osobních údajů</h1>
    </div>

    <div class="prose-privacy space-y-8 text-sm text-gray-300 leading-relaxed">

      <section>
        <h2>1. Správce osobních údajů</h2>
        <p>
          Správcem osobních údajů je Ondřej Kopecký, kontakt:
          <a href="mailto:ongy@ongy.cz" class="text-gh-primary hover:text-gh-primary-light">ongy@ongy.cz</a>.
        </p>
      </section>

      <section>
        <h2>2. Jaké údaje zpracováváme</h2>
        <table>
          <thead>
            <tr>
              <th>Údaj</th>
              <th>Účel</th>
              <th>Právní základ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>E-mail, uživatelské jméno</td>
              <td>Registrace a přihlášení, cloud sync kampaní</td>
              <td>Plnění smlouvy (poskytování služby)</td>
            </tr>
            <tr>
              <td>Heslo (hashované)</td>
              <td>Ověření identity</td>
              <td>Plnění smlouvy</td>
            </tr>
            <tr>
              <td>Herní data (kampaně, postavy, scénáře)</td>
              <td>Fungování aplikace, synchronizace mezi zařízeními</td>
              <td>Plnění smlouvy</td>
            </tr>
            <tr>
              <td>IP adresa, user agent (u feedbacku)</td>
              <td>Ochrana proti zneužití, řešení technických problémů</td>
              <td>Oprávněný zájem</td>
            </tr>
            <tr>
              <td>Návštěvnost stránek (GoatCounter)</td>
              <td>Anonymní statistiky návštěvnosti</td>
              <td>Oprávněný zájem</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>3. Analytika</h2>
        <p>
          Používáme <strong>GoatCounter</strong> — open-source analytiku, která nepoužívá cookies,
          nesleduje uživatele napříč stránkami a nesbírá osobní údaje. Data jsou plně anonymní
          a zpracovávána v souladu s GDPR bez nutnosti souhlasu.
        </p>
      </section>

      <section>
        <h2>4. Cookies a úložiště</h2>
        <p>
          Aplikace <strong>nepoužívá cookies</strong> třetích stran. Používáme výhradně
          <code>localStorage</code> prohlížeče pro:
        </p>
        <ul>
          <li>Uložení přihlašovacího tokenu</li>
          <li>Lokální uložení herních dat (kampaně, nastavení)</li>
        </ul>
        <p>Tato data zůstávají pouze ve vašem prohlížeči a nejsou sdílena s třetími stranami.</p>
      </section>

      <section>
        <h2>5. Doba uchovávání</h2>
        <p>
          Osobní údaje uchováváme po dobu existence vašeho účtu. Po smazání účtu jsou
          veškeré údaje (email, uživatelské jméno, kampaně) nevratně odstraněny.
        </p>
      </section>

      <section>
        <h2>6. Vaše práva</h2>
        <p>Podle GDPR (nařízení EU 2016/679) máte právo na:</p>
        <ul>
          <li><strong>Přístup</strong> — export vašich dat (Nastavení → Export kampaně)</li>
          <li><strong>Opravu</strong> — úprava údajů v nastavení účtu</li>
          <li><strong>Výmaz</strong> — smazání účtu a všech dat (Nastavení → Smazat účet)</li>
          <li><strong>Přenositelnost</strong> — export kampaní ve formátu JSON</li>
          <li><strong>Námitku</strong> — kontaktujte nás emailem</li>
          <li><strong>Stížnost</strong> — u Úřadu pro ochranu osobních údajů (<a href="https://www.uoou.cz" class="text-gh-primary hover:text-gh-primary-light">uoou.cz</a>)</li>
        </ul>
      </section>

      <section>
        <h2>7. Zabezpečení</h2>
        <p>
          Hesla jsou ukládána jako hash (bcrypt). Komunikace probíhá výhradně přes HTTPS.
          Přihlašovací tokeny jsou časově omezené (24 hodin).
        </p>
      </section>

      <section>
        <h2>8. Sdílení údajů</h2>
        <p>
          Vaše údaje nesdílíme s žádnými třetími stranami. Veškerá data jsou uložena
          na vlastním serveru v rámci EU.
        </p>
      </section>

      <section>
        <p class="text-gray-500 text-xs mt-8">Poslední aktualizace: 29. března 2026</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.prose-privacy h2 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  color: #c4a35a;
  margin-bottom: 0.5rem;
}

.prose-privacy ul {
  list-style: disc;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.prose-privacy table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.prose-privacy th {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(120, 90, 40, 0.2);
  color: #c4a35a;
  font-weight: 600;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.prose-privacy td {
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
}

.prose-privacy code {
  background: rgba(255, 255, 255, 0.06);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
}
</style>
