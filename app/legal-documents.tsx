import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, Shield, Cookie } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import Colors from '@/constants/colors';
import Card from '@/components/Card';

type DocumentType = 'privacy' | 'terms' | 'cookies';

export default function LegalDocumentsScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>('privacy');

  useEffect(() => {
    if (params.doc && ['privacy', 'terms', 'cookies'].includes(params.doc as string)) {
      setSelectedDoc(params.doc as DocumentType);
    }
  }, [params.doc]);

  const getDocumentContent = (type: DocumentType): string => {
    // In produzione, questi contenuti verranno caricati da file o da API
    const contents = {
      privacy: `INFORMATIVA SULLA PRIVACY

Ultimo aggiornamento: 11 Novembre 2025

1. INTRODUZIONE
Benvenuto in Stappa Drink Tracker (l'"App"). Rispettiamo la tua privacy e ci impegniamo a proteggere i tuoi dati personali. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo, conserviamo e proteggiamo le tue informazioni quando utilizzi la nostra App.

Utilizzando l'App, acconsenti alla raccolta e all'uso delle informazioni in conformità con questa policy.

2. INFORMAZIONI CHE RACCOGLIAMO
Raccogliamo i seguenti tipi di informazioni:

2.1 Informazioni Personali
- Nome: Per personalizzare la tua esperienza e identificarti nell'App
- Indirizzo Email: Per la creazione dell'account, l'autenticazione e le comunicazioni
- Numero di Telefono (facoltativo): Per l'autenticazione a due fattori (OTP) e il recupero dell'account
- Foto Profilo (facoltativa): Per personalizzare il tuo profilo
- Data di Nascita: Per verificare i requisiti di età per contenuti relativi all'alcol
- Password: Crittografata e conservata in modo sicuro per l'accesso all'account

2.2 Informazioni sull'Utilizzo
- Dati sul Consumo di Bevande: Registrazioni delle bevande timbrate/tracciate tramite l'App
- Dati sulla Posizione: Quando effettui il check-in presso esercizi commerciali (bar/pub)
- Interazioni Social: Post, commenti, recensioni, like e messaggi che crei
- Informazioni sul Dispositivo: Tipo di dispositivo, sistema operativo, versione dell'app per supporto tecnico

2.3 Cookie e Tecnologie Simili
Utilizziamo l'archiviazione locale e la gestione delle sessioni per:
- Mantenerti connesso tra le sessioni dell'app
- Ricordare le tue preferenze (lingua, impostazioni)
- Analizzare le prestazioni e i modelli di utilizzo dell'app

3. COME UTILIZZIAMO LE TUE INFORMAZIONI
Utilizziamo i tuoi dati esclusivamente per:
- Fornire e mantenere le funzionalità dell'App
- Creare e gestire il tuo account
- Abilitare funzionalità social (post, recensioni, messaggi)
- Tracciare il tuo consumo di bevande e fornire statistiche
- Verificare la tua identità (verifica email/telefono)
- Inviare notifiche importanti sul tuo account
- Migliorare le prestazioni e l'esperienza utente dell'App
- Garantire il rispetto delle restrizioni di età per contenuti alcolici

4. CONDIVISIONE E DIVULGAZIONE DEI DATI
NON vendiamo, affittiamo o scambiamo i tuoi dati personali con terze parti.

Potremmo condividere le tue informazioni solo in queste circostanze limitate:
- Con Altri Utenti: Le informazioni del tuo profilo pubblico, post e recensioni sono visibili ad altri utenti
- Con Esercizi Commerciali: Dati base di check-in quando visiti bar/pub partecipanti
- Obblighi Legali: Se richiesto dalla legge, ordine del tribunale o autorità governativa
- Fornitori di Servizi: Servizi di terze parti affidabili che ci aiutano a gestire l'App (hosting, analytics) con rigidi accordi di riservatezza

5. ARCHIVIAZIONE E SICUREZZA DEI DATI
- Posizione di Archiviazione: I tuoi dati sono archiviati su server sicuri gestiti dal nostro provider di hosting
- Crittografia: Le password sono crittografate utilizzando algoritmi standard del settore
- Controllo degli Accessi: Solo il personale autorizzato può accedere ai dati utente per scopi di manutenzione
- Periodo di Conservazione: Conserviamo i tuoi dati finché il tuo account è attivo. Puoi richiedere la cancellazione in qualsiasi momento

6. I TUOI DIRITTI
Hai il diritto di:
- Accesso: Richiedere una copia dei tuoi dati personali
- Rettifica: Aggiornare o correggere informazioni inesatte
- Cancellazione: Richiedere la cancellazione del tuo account e di tutti i dati associati
- Portabilità: Esportare i tuoi dati in un formato leggibile da macchina
- Opposizione: Opporti a determinate attività di trattamento dei dati
- Revoca del Consenso: Revocare il consenso alla raccolta dei dati in qualsiasi momento

7. PRIVACY DEI MINORI
L'App è destinata a utenti di età pari o superiore a 18 anni. Non raccogliamo consapevolmente informazioni da minori di 18 anni. Se scopriamo che un minore ci ha fornito informazioni personali, le elimineremo immediatamente.

8. UTENTI INTERNAZIONALI
Se accedi all'App dall'esterno dell'Italia/Unione Europea, tieni presente che i tuoi dati potrebbero essere trasferiti ed elaborati in Italia. Utilizzando l'App, acconsenti a questo trasferimento.

9. MODIFICHE A QUESTA POLICY
Potremmo aggiornare questa Informativa sulla Privacy di volta in volta. Ti informeremo di eventuali modifiche pubblicando la nuova policy nell'App e aggiornando la data di "Ultimo Aggiornamento". L'uso continuato dell'App dopo le modifiche costituisce accettazione della policy aggiornata.`,

      terms: `TERMINI E CONDIZIONI D'USO

Ultimo aggiornamento: 11 Novembre 2025

1. ACCETTAZIONE DEI TERMINI
Accedendo e utilizzando Stappa Drink Tracker (l'"App"), accetti e acconsenti a essere vincolato da questi Termini di Servizio. Se non accetti questi termini, ti preghiamo di non utilizzare l'App.

2. DESCRIZIONE DEL SERVIZIO
Stappa Drink Tracker è un'applicazione di social networking e tracciamento delle bevande che consente agli utenti di:
- Tracciare il consumo di bevande presso esercizi commerciali partecipanti
- Condividere contenuti social (post, storie, recensioni)
- Interagire con altri utenti e locali
- Accedere a offerte promozionali da bar e pub

3. ACCOUNT UTENTE
3.1 Registrazione
- Devi avere almeno 18 anni per utilizzare questa App
- Devi fornire informazioni accurate, complete e aggiornate durante la registrazione
- Sei responsabile del mantenimento della riservatezza delle credenziali del tuo account
- Accetti di notificarci immediatamente qualsiasi uso non autorizzato del tuo account

3.2 Tipi di Account
- Utente: Account standard per il tracciamento delle bevande e funzionalità social
- Commerciante: Account aziendale per proprietari e personale di bar/pub
- Commerciante Senior: Account commerciante avanzato con funzionalità di gestione aggiuntive

3.3 Sicurezza dell'Account
- Sei l'unico responsabile di tutte le attività che si verificano con il tuo account
- Non condividere la tua password con altri
- Ci riserviamo il diritto di sospendere o terminare gli account che violano questi termini

4. CONDOTTA DELL'UTENTE
Accetti di NON:
- Pubblicare contenuti illegali, dannosi, minacciosi, abusivi, molesti, diffamatori, volgari, osceni o altrimenti discutibili
- Impersonare qualsiasi persona o entità
- Caricare contenuti che violano i diritti di proprietà intellettuale
- Fare spam, phishing o attività fraudolente
- Tentare di ottenere accesso non autorizzato all'App o agli account di altri utenti
- Utilizzare sistemi automatizzati (bot) per interagire con l'App
- Incoraggiare comportamenti di consumo alcolico pericolosi o irresponsabili
- Pubblicare contenuti che promuovono il consumo di alcol da parte di minori

5. PROPRIETÀ DEI CONTENUTI E LICENZA
5.1 I Tuoi Contenuti
- Mantieni la proprietà di tutti i contenuti che pubblichi sull'App (post, foto, recensioni, commenti)
- Pubblicando contenuti, ci concedi una licenza mondiale, non esclusiva, gratuita per utilizzare, visualizzare, riprodurre e distribuire i tuoi contenuti all'interno dell'App
- Dichiari di avere tutti i diritti necessari sui contenuti che pubblichi

5.2 I Nostri Contenuti
- Il design, il logo, le funzionalità e le caratteristiche dell'App sono di nostra proprietà e protetti da leggi sul copyright e sui marchi
- Non puoi copiare, modificare, distribuire o effettuare reverse engineering di alcuna parte dell'App senza il nostro permesso

6. MODERAZIONE DEI CONTENUTI
Ci riserviamo il diritto di:
- Rivedere, monitorare e rimuovere qualsiasi contenuto che violi questi termini
- Sospendere o terminare account che violano ripetutamente le nostre policy
- Utilizzare sistemi automatizzati per rilevare contenuti inappropriati
- Segnalare attività illegali alle autorità competenti

7. CHECK-IN PRESSO ESERCIZI COMMERCIALI
- I dati di check-in e tracciamento delle bevande possono essere condivisi con gli esercizi partecipanti
- Gli esercizi possono offrire promozioni o premi basati sul tuo utilizzo
- Accetti che i dati di check-in siano accurati e non manipolati

8. ESCLUSIONE DI GARANZIE
L'APP È FORNITA "COSÌ COM'È" SENZA GARANZIE DI ALCUN TIPO, ESPLICITE O IMPLICITE.

9. LIMITAZIONE DI RESPONSABILITÀ
NELLA MISURA MASSIMA CONSENTITA DALLA LEGGE, NON SAREMO RESPONSABILI PER DANNI INDIRETTI, INCIDENTALI, SPECIALI, CONSEQUENZIALI O PUNITIVI.

10. MANLEVA
Accetti di manlevare e tenerci indenni da eventuali reclami, danni, perdite, responsabilità e spese derivanti dal tuo utilizzo dell'App o dalla tua violazione di questi Termini.

11. RESTRIZIONI DI ETÀ E CONSUMO RESPONSABILE
- L'App è destinata a utenti di 18 anni o più
- Promuoviamo il consumo responsabile di alcol e non incoraggiamo il consumo eccessivo
- L'App è uno strumento di tracciamento e non fornisce consulenza medica

12. PRIVACY
Il tuo utilizzo dell'App è anche regolato dalla nostra Informativa sulla Privacy.

13. MODIFICHE AI TERMINI
Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Notificheremo gli utenti di modifiche sostanziali tramite l'App.

14. TERMINAZIONE
Possiamo terminare o sospendere il tuo account in qualsiasi momento, con o senza causa o preavviso.

15. LEGGE APPLICABILE
Questi Termini sono regolati dalle leggi italiane.`,

      cookies: `POLITICA SUI COOKIE

Ultimo aggiornamento: 11 Novembre 2025

1. COSA SONO I COOKIE
I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando utilizzi la nostra App. Ci aiutano a fornirti un'esperienza migliore ricordando le tue preferenze e comprendendo come utilizzi l'App.

2. TIPI DI ARCHIVIAZIONE DATI CHE UTILIZZIAMO
Poiché Stappa Drink Tracker è un'applicazione mobile, utilizziamo principalmente meccanismi di archiviazione locale anziché cookie web tradizionali:

2.1 Archiviazione Essenziale
Scopo: Necessaria per il corretto funzionamento dell'App
- Token di Autenticazione: Per mantenerti connesso tra le sessioni
- ID Utente: Per identificare il tuo account
- Preferenza Lingua: Per ricordare la lingua scelta
- Dati di Sessione: Per mantenere la tua sessione attiva
Base Giuridica: Necessaria per l'esecuzione del contratto
Può Essere Disabilitata: No

2.2 Archiviazione Funzionale
Scopo: Per migliorare la tua esperienza e ricordare le tue preferenze
- Impostazioni Tema: Preferenza modalità scura o chiara
- Preferenze Notifiche: Le tue scelte su quali notifiche ricevere
- Ultimo Esercizio Selezionato: Per accedere rapidamente ai tuoi locali preferiti
Base Giuridica: Il tuo consenso
Può Essere Disabilitata: Sì

2.3 Archiviazione Analytics
Scopo: Per comprendere come gli utenti interagiscono con l'App e migliorare le prestazioni
- Statistiche d'Uso: Quali funzionalità sono più utilizzate
- Metriche di Prestazione: Tempi di caricamento, crash, errori
Base Giuridica: Il tuo consenso
Può Essere Disabilitata: Sì

3. DATI CHE NON RACCOGLIAMO TRAMITE COOKIE/ARCHIVIAZIONE
NON utilizziamo:
- Cookie pubblicitari di terze parti
- Cookie di tracciamento cross-site
- Vendita o condivisione dei tuoi dati con broker di dati

4. COME GESTIRE LE PREFERENZE DI ARCHIVIAZIONE
Puoi controllare l'archiviazione dei dati tramite le impostazioni dell'App (Privacy) o le impostazioni del dispositivo.

5. SERVIZI DI TERZE PARTI
Potremmo utilizzare servizi come Expo Push Notifications e Analytics che archiviano dati per migliorare il servizio.

6. SICUREZZA DEI DATI
Tutti i dati archiviati localmente sul tuo dispositivo sono protetti dalle funzionalità di sicurezza native del tuo dispositivo e non accessibili ad altre app.

7. PRIVACY DEI MINORI
Non raccogliamo consapevolmente dati da minori di 18 anni.

8. MODIFICHE A QUESTA POLICY
Potremmo aggiornare questa Politica sui Cookie per riflettere cambiamenti nelle nostre pratiche o per motivi legali.

9. I TUOI DIRITTI
Hai il diritto di accesso, rettifica, cancellazione, portabilità e opposizione al trattamento dei dati.

10. CONTATTI
Se hai domande sul nostro utilizzo di cookie e archiviazione locale, contattaci.`,
    };

    return contents[type];
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'privacy':
        return <Shield size={24} color={Colors.orange} />;
      case 'terms':
        return <FileText size={24} color={Colors.orange} />;
      case 'cookies':
        return <Cookie size={24} color={Colors.orange} />;
    }
  };

  const documents: { type: DocumentType; title: string; subtitle: string }[] = [
    {
      type: 'privacy',
      title: t('auth.privacyPolicy'),
      subtitle: 'Informativa sul trattamento dei dati personali',
    },
    {
      type: 'terms',
      title: t('auth.termsOfService'),
      subtitle: 'Termini e condizioni d\'uso dell\'applicazione',
    },
    {
      type: 'cookies',
      title: t('auth.cookiePolicy'),
      subtitle: 'Politica sui cookie e tecnologie simili',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Documenti Legali</Text>
          <Text style={styles.headerSubtitle}>Privacy, Termini e Cookie</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Document Selector */}
        <View style={styles.selectorContainer}>
          {documents.map((doc) => (
            <TouchableOpacity
              key={doc.type}
              style={[
                styles.selectorButton,
                selectedDoc === doc.type && styles.selectorButtonActive,
              ]}
              onPress={() => setSelectedDoc(doc.type)}
            >
              <View style={styles.selectorIcon}>
                {getDocumentIcon(doc.type)}
              </View>
              <View style={styles.selectorTextContainer}>
                <Text
                  style={[
                    styles.selectorTitle,
                    selectedDoc === doc.type && styles.selectorTitleActive,
                  ]}
                >
                  {doc.title}
                </Text>
                <Text style={styles.selectorSubtitle}>{doc.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Document Content */}
        <Card style={styles.documentCard}>
          <ScrollView
            style={styles.documentScroll}
            contentContainerStyle={styles.documentContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.documentText}>
              {getDocumentContent(selectedDoc)}
            </Text>
          </ScrollView>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  selectorContainer: {
    gap: 8,
    marginBottom: 16,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectorButtonActive: {
    borderColor: Colors.orange,
    backgroundColor: Colors.amber + '10',
  },
  selectorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.amber + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  selectorTitleActive: {
    color: Colors.orange,
    fontWeight: '700',
  },
  selectorSubtitle: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  documentCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  documentScroll: {
    flex: 1,
  },
  documentContent: {
    padding: 20,
  },
  documentText: {
    fontSize: 13,
    lineHeight: 22,
    color: Colors.text.primary,
  },
});
