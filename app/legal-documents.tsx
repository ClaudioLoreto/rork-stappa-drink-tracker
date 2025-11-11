import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, Shield, Cookie } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import Colors from '@/constants/colors';
import Card from '@/components/Card';

type DocumentType = 'privacy' | 'terms' | 'cookies';

export default function LegalDocumentsScreen() {
  const { t } = useLanguage();
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>('privacy');

  const getDocumentContent = (type: DocumentType): string => {
    // In produzione, questi contenuti verranno caricati da file o da API
    const contents = {
      privacy: `INFORMATIVA SULLA PRIVACY

Ultimo aggiornamento: ${new Date().toLocaleDateString('it-IT')}

1. INTRODUZIONE
Stappa rispetta la tua privacy e si impegna a proteggere i tuoi dati personali. Questa informativa sulla privacy ti informerà su come ci prendiamo cura dei tuoi dati personali quando visiti il nostro sito web o utilizzi la nostra applicazione mobile.

2. DATI CHE RACCOGLIAMO
Potremmo raccogliere, utilizzare, conservare e trasferire diversi tipi di dati personali su di te:
- Dati di identità: nome, cognome, username
- Dati di contatto: email, numero di telefono
- Dati tecnici: indirizzo IP, dati di accesso, tipo e versione del browser, impostazione del fuso orario e posizione, tipi e versioni dei plugin del browser, sistema operativo e piattaforma
- Dati di profilo: username e password, i tuoi interessi, preferenze, feedback e risposte ai sondaggi
- Dati di utilizzo: informazioni su come utilizzi il nostro sito web, prodotti e servizi
- Dati di marketing e comunicazione: le tue preferenze nel ricevere marketing da noi e dalle nostre terze parti

3. COME UTILIZZIAMO I TUOI DATI
Utilizziamo i tuoi dati personali solo quando la legge ci permette di farlo. Più comunemente, utilizzeremo i tuoi dati personali nelle seguenti circostanze:
- Quando abbiamo bisogno di eseguire il contratto che stiamo per stipulare o abbiamo stipulato con te
- Quando è necessario per i nostri legittimi interessi (o quelli di una terza parte) e i tuoi interessi e diritti fondamentali non prevalgono su questi interessi
- Quando dobbiamo rispettare un obbligo legale o normativo

4. SICUREZZA DEI DATI
Abbiamo messo in atto misure di sicurezza appropriate per impedire che i tuoi dati personali vengano accidentalmente persi, utilizzati o accessibili in modo non autorizzato, alterati o divulgati.

5. CONSERVAZIONE DEI DATI
Conserveremo i tuoi dati personali solo per il tempo necessario a soddisfare gli scopi per i quali li abbiamo raccolti, anche ai fini del soddisfacimento di eventuali obblighi legali, contabili o di reporting.

6. I TUOI DIRITTI LEGALI
In determinate circostanze, hai diritti ai sensi delle leggi sulla protezione dei dati in relazione ai tuoi dati personali:
- Diritto di accesso ai tuoi dati personali
- Diritto di rettifica
- Diritto alla cancellazione
- Diritto di opporti al trattamento
- Diritto alla portabilità dei dati
- Diritto di revocare il consenso

7. CONTATTI
Se hai domande su questa informativa sulla privacy o sulle nostre pratiche sulla privacy, contattaci a: privacy@stappa.app

8. MODIFICHE ALL'INFORMATIVA
Potremmo aggiornare questa informativa di volta in volta. Ti informeremo di eventuali modifiche pubblicando la nuova informativa su questa pagina.`,

      terms: `TERMINI E CONDIZIONI D'USO

Ultimo aggiornamento: ${new Date().toLocaleDateString('it-IT')}

1. ACCETTAZIONE DEI TERMINI
Accedendo e utilizzando Stappa, accetti di essere vincolato da questi Termini e Condizioni d'Uso, da tutte le leggi e i regolamenti applicabili e accetti di essere responsabile del rispetto delle leggi locali applicabili.

2. LICENZA D'USO
Ti viene concessa una licenza limitata, non esclusiva, non trasferibile per utilizzare l'applicazione Stappa esclusivamente per uso personale, non commerciale, in conformità con questi termini.

3. REGISTRAZIONE E ACCOUNT
Per utilizzare determinate funzionalità dell'applicazione, devi registrarti e creare un account. Accetti di:
- Fornire informazioni accurate, complete e aggiornate durante la registrazione
- Mantenere la sicurezza della tua password e del tuo account
- Notificare immediatamente Stappa di qualsiasi uso non autorizzato del tuo account
- Essere responsabile di tutte le attività che si verificano sotto il tuo account

4. CONDOTTA DELL'UTENTE
Accetti di NON:
- Utilizzare l'applicazione per scopi illegali o non autorizzati
- Interferire o interrompere l'applicazione o i server o le reti connesse all'applicazione
- Tentare di ottenere accesso non autorizzato all'applicazione, ad altri account, sistemi informatici o reti connesse all'applicazione
- Pubblicare, caricare o trasmettere contenuti che siano illegali, dannosi, minacciosi, abusivi, molesti, diffamatori, volgari, osceni o altrimenti discutibili
- Impersonare qualsiasi persona o entità o dichiarare falsamente o altrimenti travisare la tua affiliazione con una persona o entità

5. VALIDAZIONE CONSUMAZIONI
Gli utenti di Stappa possono validare il consumo di bevande presso gli stabilimenti partner. Ogni validazione:
- È soggetta a verifica da parte dello stabilimento
- Non può essere annullata dall'utente una volta confermata
- Deve corrispondere a una consumazione reale
- Può essere contestata dallo stabilimento in caso di frode

6. MERCHANT
Gli utenti con ruolo Merchant o Senior Merchant:
- Sono responsabili della gestione del proprio stabilimento nell'app
- Devono verificare accuratamente le validazioni degli utenti
- Possono creare e gestire promozioni nel rispetto delle normative locali
- Sono responsabili dell'accuratezza delle informazioni sul proprio stabilimento

7. PROPRIETÀ INTELLETTUALE
Tutto il contenuto presente nell'applicazione, inclusi ma non limitati a testo, grafica, loghi, icone, immagini, clip audio, download digitali e compilazioni di dati, è di proprietà di Stappa o dei suoi fornitori di contenuti ed è protetto dalle leggi internazionali sul copyright.

8. LIMITAZIONE DI RESPONSABILITÀ
Stappa non sarà responsabile per eventuali danni di qualsiasi tipo derivanti dall'uso dell'applicazione, inclusi, ma non limitati a, danni diretti, indiretti, incidentali, punitivi e consequenziali.

9. MODIFICHE AI TERMINI
Stappa si riserva il diritto di modificare questi termini in qualsiasi momento. Le modifiche entreranno in vigore immediatamente dopo la pubblicazione. L'uso continuato dell'applicazione dopo tali modifiche costituisce l'accettazione dei nuovi termini.

10. LEGGE APPLICABILE
Questi termini sono regolati e interpretati in conformità con le leggi italiane, senza riguardo ai suoi conflitti di disposizioni di legge.

11. RISOLUZIONE DELLE CONTROVERSIE
Qualsiasi controversia derivante da o relativa a questi termini sarà risolta attraverso arbitrato vincolante in conformità con le regole dell'arbitrato italiano.

12. CONTATTI
Per domande su questi Termini e Condizioni, contattaci a: legal@stappa.app

13. DIVISIBILITÀ
Se una qualsiasi disposizione di questi termini dovesse essere ritenuta non valida o inapplicabile, tale disposizione sarà eliminata o limitata nella misura minima necessaria, e le restanti disposizioni continueranno ad essere pienamente efficaci.`,

      cookies: `POLITICA SUI COOKIE

Ultimo aggiornamento: ${new Date().toLocaleDateString('it-IT')}

1. COSA SONO I COOKIE
I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo (computer, tablet o smartphone) quando visiti un sito web. I cookie permettono al sito di riconoscerti e ricordare le tue preferenze.

2. COME UTILIZZIAMO I COOKIE
Stappa utilizza i cookie per:
- Mantenere la tua sessione attiva quando utilizzi l'applicazione
- Ricordare le tue preferenze (lingua, tema, ecc.)
- Analizzare come gli utenti utilizzano l'applicazione per migliorare l'esperienza
- Fornire contenuti personalizzati basati sui tuoi interessi

3. TIPI DI COOKIE CHE UTILIZZIAMO

3.1 Cookie Necessari
Questi cookie sono essenziali per il funzionamento dell'applicazione. Includono, ad esempio, i cookie che ti permettono di accedere ad aree sicure dell'applicazione.

Esempi:
- session_token: Mantiene la tua sessione attiva
- auth_token: Verifica la tua identità
- Durata: Sessione o 30 giorni

3.2 Cookie di Preferenze
Questi cookie permettono all'applicazione di ricordare le scelte che fai (come la lingua o la regione in cui ti trovi) e forniscono funzionalità migliorate e più personali.

Esempi:
- language: Memorizza la tua preferenza linguistica
- theme: Memorizza se preferisci il tema chiaro o scuro
- Durata: 1 anno

3.3 Cookie Analitici
Questi cookie ci permettono di riconoscere e contare il numero di visitatori e di vedere come i visitatori si muovono nell'applicazione quando la utilizzano. Questo ci aiuta a migliorare il modo in cui l'applicazione funziona.

Esempi:
- analytics_id: Identifica univocamente il tuo dispositivo per scopi analitici
- page_views: Conta quante volte visiti determinate pagine
- Durata: 2 anni

3.4 Cookie di Marketing (se applicabili)
Questi cookie vengono utilizzati per tracciare i visitatori attraverso i siti web. L'intenzione è quella di visualizzare annunci che siano rilevanti e coinvolgenti per il singolo utente.

4. COOKIE DI TERZE PARTI
In alcuni casi speciali, utilizziamo anche cookie forniti da terze parti di fiducia:

- Google Analytics: Per analizzare l'utilizzo dell'applicazione
- Expo: Per la distribuzione e l'aggiornamento dell'applicazione
- Firebase (se utilizzato): Per notifiche push e analytics

5. GESTIONE DEI COOKIE
Puoi controllare e/o eliminare i cookie come desideri. Puoi eliminare tutti i cookie già presenti sul tuo dispositivo e puoi impostare la maggior parte dei browser per impedire che vengano inseriti.

Come gestire i cookie:
- Attraverso le impostazioni dell'applicazione (Impostazioni > Privacy)
- Attraverso le impostazioni del tuo browser
- Attraverso le impostazioni del tuo dispositivo mobile

ATTENZIONE: Se scegli di disabilitare i cookie necessari, alcune funzionalità dell'applicazione potrebbero non funzionare correttamente.

6. COOKIE E DATI PERSONALI
Alcuni dei nostri cookie possono contenere dati personali, ad esempio, se fai clic su "ricordami" all'accesso, un cookie memorizzerà il tuo username. La maggior parte dei cookie non raccoglie informazioni che ti identificano, ma raccolgono invece informazioni più generali come il modo in cui gli utenti arrivano e utilizzano l'applicazione, o la posizione generale di un utente.

7. AGGIORNAMENTI DELLA POLITICA
Potremmo aggiornare questa politica sui cookie di volta in volta per riflettere, ad esempio, modifiche ai cookie che utilizziamo o per altri motivi operativi, legali o normativi. Ti invitiamo quindi a rivisitare regolarmente questa politica sui cookie per rimanere informato sul nostro utilizzo dei cookie e delle tecnologie correlate.

8. ULTERIORI INFORMAZIONI
Per ulteriori informazioni sui cookie e su come gestirli, visita:
- www.aboutcookies.org
- www.allaboutcookies.org

9. CONTATTI
Se hai domande sulla nostra politica sui cookie, contattaci a: privacy@stappa.app

10. CONSENSO
Utilizzando la nostra applicazione, acconsenti all'utilizzo dei cookie in conformità con questa politica. Se non accetti l'uso dei cookie, devi configurare il tuo browser di conseguenza o astenerti dall'utilizzare l'applicazione.`,
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
