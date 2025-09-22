
'use server';

/**
 * @fileOverview A simple chat flow that responds to user messages.
 *
 * - chat - A function that handles the chat interaction.
 */

import { ai } from '@/ai/genkit';
import { ChatInputSchema, ChatOutputSchema, type ChatInput } from '@/lib/ai-schemas';
import mammoth from 'mammoth';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { getStorage, ref, getBytes } from 'firebase/storage';

async function getKnowledgeBaseContent(): Promise<string> {
    const filesCollection = collection(db, "knowledgeBaseFiles");
    const q = query(filesCollection, orderBy("createdAt", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log('No knowledge base files found in Firestore.');
            return '';
        }

        const storage = getStorage();
        const fileContents = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
                const fileData = doc.data();
                const fileRef = ref(storage, fileData.url);
                try {
                    const buffer = await getBytes(fileRef);
                    if (fileData.name.endsWith('.txt')) {
                        return Buffer.from(buffer).toString('utf-8');
                    } else if (fileData.name.endsWith('.docx')) {
                        const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
                        return result.value;
                    }
                } catch (readError) {
                   console.error(`Error processing file ${fileData.name} from Storage:`, readError);
                }
                return '';
            })
        );
        
        const nonEmptyContents = fileContents.filter(content => content && content.trim() !== '');
        if (nonEmptyContents.length > 0) {
            return `START OF KNOWLEDGE BASE\n${nonEmptyContents.join('\n\n---\n\n')}\nEND OF KNOWLEDGE BASE`;
        }

    } catch (error) {
        console.error('Error fetching knowledge base files from Firestore:', error);
    }
    
    return '';
}

export async function chat(input: ChatInput) {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, message, attachment }) => {
    
    const knowledgeBaseContent = await getKnowledgeBaseContent();

    let systemPrompt = `Thanzi La Onse (TLO) Model Knowledge Base
Project Overview and Objectives

What is the TLO Model? The Thanzi La Onse (TLO) Model is an open-source epidemiological and economic simulation framework developed to inform health policy in low-income countries
tlomodel.org
tlomodel.org
. “Thanzi La Onse” means “Health for All,” reflecting its mission. The model is a core part of the broader Thanzi La Onse collaboration funded by Wellcome (with past support from GCRF and UKRI) and involves a partnership between institutions in Malawi and the UK
tlomodel.org
. Key partners include the Malawi Ministry of Health (via Kamuzu University of Health Sciences) and research centers at Imperial College London, University College London, University of York, and the East, Central and Southern Africa Health Community
tlomodel.org
. Development is active – the code is openly available on GitHub and updated frequently (last update September 17, 2025)
tlomodel.org
. The latest version is also archived on Zenodo for citation
tlomodel.org
.

Fundamental Aim: The TLO Model’s primary aim is to “develop the use of epidemiological and economic science to effect a step-change in the way that health priorities are addressed through policy interventions in low-income countries.”
tlomodel.org
 In simpler terms, it brings together disease modeling and health economics to improve how decisions are made about healthcare funding and interventions. The model explicitly represents the generation of health gains in a population – linking inputs like resources and services to outputs like improved health – so that policy-makers can see how different choices might improve population health
tlomodel.org
. Ultimately, the goal is to provide evidence for more effective and equitable health policies.

Objectives and Scope: To achieve this aim, TLO was designed as a data-grounded, internally consistent representation of each step in producing health gains
tlomodel.org
. It covers: (1) how health resources (funding, workforce, supplies) translate into service capacity
tlomodel.org
; (2) the need for healthcare arising from the many causes of illness each individual may experience over their life
tlomodel.org
; (3) the decisions and behaviors that determine how supply and demand for care meet (or miss) each other – for example, whether people seek care and how the system triages or queues patients
tlomodel.org
; (4) the quality and effectiveness of care delivered, accounting for gaps in healthcare quality or access
tlomodel.org
; and (5) the long-term outcomes – how today’s interventions (like treatment or prevention programs) affect future disease burden and health outcomes
tlomodel.org
. All these processes are linked with feedback loops: the model framework “mediates dynamic feedback between them”
tlomodel.org
. This means TLO can capture complex interactions – for example, how an overwhelmed health workforce might reduce care quality, or how reducing disease today can free up resources tomorrow. By encapsulating the whole chain from inputs to outcomes, the TLO Model serves as a “whole-health-system” simulator for policy analysis.

Model Scope and Design

Whole-Health-System Individual-Based Model: The TLO Model is an individual-based simulation (also known as an agent-based model) of the health system, focused currently on Malawi’s context. It is described as a “Malawi-specific, individual-based ‘all diseases—whole health-system’ model.”
tlomodel.org
 In practice, this means the model simulates a virtual population of individual people, each with their own characteristics and health conditions, and how they interact with health services over time. It encompasses all major disease areas and the functioning of the health system in one unified framework. Unlike many models that look at a single disease or program, TLO simulates multiple diseases and interventions together, along with system constraints (like workforce and clinics) that connect them. This broad scope allows analysis of cross-cutting policies (e.g. investing in the health workforce or infrastructure) as well as disease-specific strategies, and importantly, the synergies or trade-offs between them.

Dynamic Multi-Disease Simulation: At its core, TLO is a stochastic (randomized) simulation that progresses over time, evolving the health status of individuals and the state of the health system. The model integrates several components: an epidemiological model for each disease of interest, models of health-related behaviors, and models of health system capacity. These operate concurrently. For example, an individual in the simulation may develop an illness (per the disease natural history), decide whether and when to seek care (modeled via health-seeking behavior rules), and if they do seek care, the outcome will depend on healthcare availability and quality (modeled via the health system component). This design allows complex cause-effect chains to be represented. As one publication summarizes, “the Thanzi la Onse model…is an individual-based multi-disease simulation model that simulates HIV and tuberculosis transmission, alongside other diseases (e.g., malaria, non-communicable diseases, and maternal conditions), and gates access to essential medicines according to empirical estimates of availability. The model integrates dynamic disease modelling with health system engagement behaviour, health system use, and capabilities (i.e., personnel and consumables).”
tlomodel.org
tlomodel.org
. In other words, it not only tracks infections and treatments, but also whether the health system has the staff, drugs, and other inputs needed – if not, patients may not get treated, or there may be delays, which the model reflects. This realism is crucial for policy: it can show, for instance, that scaling up a drug program might fail to achieve expected gains if clinics are understaffed or medicines stock-out.

Time Horizon and Outcomes: The model can simulate many years or decades into the future to assess long-term outcomes of policies. For example, analyses have run from 2019 through 2040 to project the future health burden under different scenarios
tlomodel.org
tlomodel.org
. Key outcomes tracked include incidence and prevalence of diseases, mortality (and life expectancy), and aggregated metrics like Disability-Adjusted Life Years (DALYs) that quantify the overall health burden. The TLO Model explicitly calculates DALYs lost due to various conditions in the population (through a module called HealthBurden), allowing it to compare the health impact of different interventions on a common scale
tlomodel.org
. Economic outcomes can also be derived by combining cost data with these health outcomes (e.g. cost per DALY averted, or return on investment, described later).

Major Components and Modules: The TLO Model is modular by design – it consists of many modules, each representing a specific aspect of health or healthcare. These modules can be thought of as sub-models that plug into the overall simulation. They are often organized by health domain or disease area. The documentation provides a breakdown of all major modules
tlomodel.org
tlomodel.org
, which include:

Core Population and Health Modules:

Demography: Handles population demographics – births, aging, and non-disease mortality. This sets up the population structure and background death rates (e.g. deaths from causes not explicitly modeled)
tlomodel.org
. It ensures the simulated population resembles Malawi’s age structure and can evolve over time (including the effect of general mortality improvements).

Lifestyle: Manages individual risk factors and socio-demographic variables that can change over the life course
tlomodel.org
. For example, education level, urban/rural residence, smoking and alcohol use, diet/nutrition, and access to sanitation can be included. These factors can affect disease risks or health-seeking behavior.

Symptom Manager: A generic module that controls the onset and resolution of symptoms in individuals
tlomodel.org
. This includes symptoms from diseases that are not explicitly modeled as separate modules. It provides a way to represent minor ailments or general illness that can still influence health-seeking (for instance, a person might go to a clinic due to any serious symptom, even if the model doesn’t have a dedicated module for the underlying cause).

HealthSeekingBehaviour: Models whether, how, and where people seek healthcare when ill
tlomodel.org
. This is crucial for connecting epidemiology to the health system. It can incorporate factors like probability of seeking care for a given severity, delays in seeking care, and preferences for certain providers or levels of care.

HealthBurden: Tracks the accumulation of health burden in the population, especially in terms of DALYs (accounting for years of life lost to death and years lived with disability)
tlomodel.org
. This module essentially logs outcomes to evaluate interventions – for example, it can compute total DALYs in each scenario, or DALYs averted by an intervention.

Healthcare System Modules:

HealthSystem: Represents the capacities and constraints of the healthcare system itself
tlomodel.org
. This module keeps track of resources like healthcare worker hours, availability of medical consumables (medications, tests, supplies), and equipment (e.g. hospital beds, operating theaters). It monitors utilization of these resources as simulated patients seek care. If resources are limited, the HealthSystem module can impose limits on services (e.g. only so many patients can be treated per day if staff or supplies run out). This allows the model to simulate scenarios like workforce expansions or stockout reductions and see how they impact outcomes.

RoutineImmunization: A sub-module handling routine childhood immunization services
tlomodel.org
. It simulates vaccination programs (for instance, scheduling of infant immunizations) and their coverage, which can influence disease modules like measles.

Other health system processes: The model also includes representations of in-patient care logistics (e.g. hospital bed-days usage for admissions) and possibly referral systems. Many of these are captured through the Health System Interaction (HSI) events framework (described below) which links diseases to required services.

Reproductive, Maternal, Newborn Health:

Contraception: Models fertility (fecundity), contraceptive use (including method switching), and the resulting pregnancies
tlomodel.org
. By simulating family planning uptake, this module influences birth rates and maternal health outcomes. (This component has been described in a publication as well
tlomodel.org
 and is calibrated to data on contraceptive use).

Maternal and Newborn Health: Covers the course of pregnancy, labor & delivery, and the postnatal period, including complications and maternal/newborn healthcare services
tlomodel.org
. This module simulates antenatal care visits, obstetric complications (e.g. hemorrhage, eclampsia), skilled birth attendance vs. unattended births, emergency obstetric care, and newborn outcomes (like neonatal mortality). It’s a detailed module because maternal-newborn health is a significant area of policy interest. (The documentation references a detailed PDF for this module
tlomodel.org
.)

Labor & Delivery Supervisors: There are also modules like LabourSkilledBirthAttendance and PregnancySupervisor/PostnatalSupervisor (mentioned in resource files
tlomodel.org
tlomodel.org
), which likely help coordinate the simulation of maternity services and ensure appropriate care pathways during childbirth and postpartum.

Early Childhood Diseases:
The model includes key illnesses affecting young children:

Acute Lower Respiratory Infections (ALRI): This covers pediatric pneumonia and bronchiolitis (from viral or bacterial causes) and their treatments
tlomodel.org
. ALRI is a leading cause of child mortality, so the module simulates infection incidence (with pathogens like RSV, pneumococcus, etc.) and outcomes with or without interventions (like antibiotics, oxygen therapy).

Diarrhea: Childhood diarrheal disease (both viral and bacterial) leading to dehydration
tlomodel.org
. This module handles episodes of diarrhea and treatment interventions (oral rehydration, zinc, IV fluids for severe cases).

Childhood Undernutrition: This includes wasting (acute malnutrition) and stunting (chronic malnutrition) and their effects
tlomodel.org
. Undernutrition can both be an outcome (from food insecurity or disease) and a risk factor that exacerbates other illnesses. The model can simulate nutrition interventions or simply track how improving nutrition status could reduce disease severity.

Major Communicable Diseases:
The TLO Model has dedicated modules for many communicable (infectious) diseases of public health importance in Malawi:

HIV/AIDS: Simulates HIV transmission, progression, and interventions (e.g. ART – antiretroviral therapy, and prevention programs)
tlomodel.org
. It can represent different stages of HIV, coverage of treatment, and impact on mortality and new infections.

Tuberculosis (TB): Simulates TB infection (which can be latent or active), TB disease progression, and control programs (like TB treatment regimens, preventive therapy, and interactions with HIV)
tlomodel.org
. TB is often co-modeled with HIV due to co-infection dynamics.

Malaria: Covers malaria transmission (likely with a seasonal component), episodes of malaria illness, and interventions like bed nets, indoor spraying, and treatment
tlomodel.org
.

Measles: Models measles infection and outbreaks, including the effect of immunization campaigns or routine immunization coverage
tlomodel.org
.

Schistosomiasis: Models schisto (bilharzia) infections and treatment programs (like mass drug administration)
tlomodel.org
.

Each communicable disease module encapsulates the epidemiology of that disease and links to the health system when a case needs diagnosis or treatment. For example, the HIV module will generate patients needing ART; the TB module will generate patients who may need sputum tests, X-rays, TB drugs, etc., which ties into health system resource requirements.

Non-Communicable Diseases (NCDs) and Injuries:
TLO also represents a range of NCDs and injury conditions, acknowledging the growing burden of chronic diseases:

Cancers: There are specific modules for several cancers, including Bladder Cancer, Breast Cancer, Cervical Cancer, Oesophageal Cancer, Prostate Cancer, and an “Other Adult Cancers” category for less common ones
tlomodel.org
tlomodel.org
. These modules simulate incidence (often rising with age), disease progression, and treatment pathways (surgery, chemotherapy, palliative care) for each cancer type. For example, the breast cancer module will determine how cancers are detected and treated (if at all) in the model, affecting survival.

Cardio-Metabolic Diseases: A combined module covers Type 2 Diabetes, Hypertension, Stroke, Ischemic Heart Disease, and Myocardial Infarction
tlomodel.org
. These are interrelated cardiovascular/metabolic conditions. The module likely tracks risk factors (some from the Lifestyle module, like smoking or BMI) and simulates events like heart attacks or strokes, plus any interventions (e.g. hypertension control) if included.

Chronic Respiratory Disease: Chronic Obstructive Pulmonary Disease (COPD) is included
tlomodel.org
. COPD may be modeled as a chronic condition influencing mortality and as a risk factor for other issues (like increased pneumonia risk).

Mental Health: Depression is explicitly modeled
tlomodel.org
, including severe outcomes like self-harm/suicide. The model can simulate treatment of depression (e.g. therapy, medications) and the effect on DALYs.

Neurological: Epilepsy is modeled
tlomodel.org
, tracking seizures and treatment with anti-epileptics, etc.

Injuries: Road Traffic Injuries (RTIs) have a module
tlomodel.org
 that simulates accidents and injury treatment. RTIs are a significant cause of trauma and death, so this module would contribute to surgical and emergency care burden in the model.

Other Common Conditions: The documentation mentions a set of “Other Non-Communicable Conditions” – for example Chronic Lower Back Pain, Chronic Kidney Disease, etc., which are simplified in the model
tlomodel.org
. These may not be fully detailed like the above diseases, but are included to capture some burden. Often these are represented as causing some disability or healthcare usage without needing intricate modeling.

Each module is implemented in the code (within the tlo.methods package) and comes with its own data inputs and parameters. Importantly, modules are interconnected through individuals and the health system. A person in the simulation can have multiple conditions (co-morbidities), and an event like a clinic visit could address multiple issues at once. The lifestyle and risk factor trajectories feed into disease incidence (e.g. smoking history raising lung disease risk, or obesity raising diabetes risk), and successful treatments feed back into improved survival and lower future burden. This holistic approach is what makes TLO a “whole-system” model rather than a collection of separate models.

Health System Interaction Events: A distinctive feature of TLO is how it links health conditions with health service delivery via Health System Interaction (HSI) events. The model defines a catalog of events that represent a person interfacing with the healthcare system for a specific reason – for example, an Outpatient consultation, a Hospital admission, a Surgery, a Diagnostic test appointment, etc., often categorized by disease or service
tlomodel.org
. For each HSI event, the model documentation specifies: (a) a description of the treatment/service delivered, (b) the level of health facility at which it occurs, and (c) the “appointment footprint”, which is essentially the resource requirements (in terms of appointment types, staff time, and possibly consumables or bed-days needed)
tlomodel.org
.

To illustrate, for the Bladder Cancer module, the HSI events listed include an Investigation appointment at a secondary hospital (facility level 1b) requiring an outpatient visit slot, a Treatment event at a central hospital (level 3) requiring a major surgery and 5 inpatient bed-days, and a PalliativeCare event at level 2 requiring 15 bed-days of general ward care
tlomodel.org
. Another example: the Childhood ALRI module has an event Pneumonia_Treatment_Outpatient at a primary care level (facility 0) with a certain consultation footprint
tlomodel.org
. Each disease module contributes such events appropriate to its care protocols.

During the simulation, when an individual’s health state triggers a need for care (say, a child develops severe pneumonia), the model schedules the corresponding HSI event (e.g. “Pneumonia treatment”). The HealthSystem module will check if the required resources (an outpatient visit slot, antibiotics, etc.) are available at the required facility level. If yes, the event takes place (the child gets treated, consuming resources and incurring whatever health benefit or outcome distribution is defined). If resources are lacking – for instance, if all hospital beds or staff are already occupied – the event might be delayed or handled at a lower level (the model can decide dynamically, or mark that care was not received). A facility level marked as “?” in the definitions means the model will choose the level dynamically (perhaps based on severity or proximity)
tlomodel.org
. This HSI system ensures that “mismatches between demand and supply” of healthcare (one of the objectives noted in the design
tlomodel.org
) are explicitly modeled. It captures scenarios like overcrowding (when too many events compete for limited resources) or task-shifting (if a service can be done at different levels). The list of HSI events is extensive, covering all modules, and is available as a CSV for reference
tlomodel.org
tlomodel.org
. This mechanism is how TLO connects disease outcomes with health system performance. It’s a powerful way to test interventions like adding staff or expanding clinics: the model will simulate more events being successfully serviced rather than postponed or dropped, leading to better health outcomes quantitatively.

Economic and Policy Features: Beyond health outcomes, TLO incorporates economic evaluation elements. The model tracks resource utilization in detail (like how many drugs used, bed-days occupied, staff hours spent), which can be translated into costs. Indeed, a dedicated set of costing resource files provides unit costs for consumables, equipment, facility operations, and human resources, as well as economic parameters like inflation and exchange rates
tlomodel.org
tlomodel.org
. For example, files exist for “Costing Consumables”, “Costing Equipment”, “Costing Facility Operations”, “Costing HR” (human resources), etc.
tlomodel.org
. With these, the model can estimate total healthcare expenditures under each scenario. It also includes data on health expenditure scenarios themselves: a “Health Spending Projections” file and resource mapping
tlomodel.org
, which were used to simulate changes in funding (e.g. what happens if donor aid declines). By combining cost outputs with DALYs, one can compute cost-effectiveness metrics or Return on Investment. In one analysis, for instance, the model predicted that scaling up the healthcare workforce could yield an ROI as high as 8:1 in terms of economic benefits relative to costs
tlomodel.org
. The integration of costing means TLO is not just an epidemiological model but also a tool for economic evaluation and health financing questions.

Validation and Calibration: Each module in TLO is informed by data and evidence specific to Malawi or similar settings. The model’s breadth is matched by a breadth of data sources used to parameterize and calibrate it (described in the next section). Model outputs (like disease incidence or deaths) are calibrated against historical data when available, and many results have undergone peer review via publications (adding confidence that the model is producing realistic outcomes). For example, a Lancet Global Health study in 2025 reported that the model’s estimates of resource use in Malawi’s health system for 2015–2019 aligned with observed data
tlomodel.org
tlomodel.org
. Validation is an ongoing process, with updates as new data emerge.

In summary, the TLO Model is a comprehensive, modular simulation of a country’s health system and population health, unique in spanning from individual-level disease dynamics to system-wide capacity and cost considerations. Its design enables users to ask “what if” questions that factor in both epidemiological effects and health system constraints – for example: What if we expand the health workforce?, What if we introduce a new vaccine or scale up a treatment program?, What if donor funding is cut by half?. The model will simulate the outcomes (health impact, costs, etc.) of such scenarios in silico, providing evidence to guide policy.

Data Sources and Model Calibration

A model of this scope must be built on a strong empirical foundation. The TLO team has invested heavily in gathering and integrating data. The documentation lists a very extensive array of data sources that feed into the model’s parameters and initial conditions
tlomodel.org
tlomodel.org
. These include both country-specific data for Malawi and global research evidence. Some highlights:

Demographic Data: Official statistics form the backbone of the population model. TLO uses Malawi’s Census data and Demographic and Health Surveys (DHS) to shape the population structure and dynamics. For example, the Malawi DHS 2010 and 2015-16 are cited as sources
tlomodel.org
, as is the 2018 Malawi Population and Housing Census
tlomodel.org
. These provide baseline population counts by age/sex, fertility rates, mortality rates, and other demographic indicators. The model also references United Nations World Population Prospects 2019 for standard demographic parameters
tlomodel.org
. Together, these ensure that the simulated population in 2019 (for instance) matches Malawi’s actual population (in terms of size and age distribution), and that births and non-modeled deaths occur at realistic rates going forward.

Background Mortality and Risk: For causes of death not explicitly modeled (e.g. some background mortality or external causes), data such as the Global Burden of Disease (GBD) 2017 results are used
tlomodel.org
. GBD provides mortality rates by age, cause, and year; TLO uses these to calibrate cause-specific mortality. For example, if the model doesn’t include drowning or certain cancers, GBD can supply the death rates for those to be accounted as “background” deaths (the Demography module handles those). A study on external causes of death in Malawi (Chasimpha et al. 2015) is also cited
tlomodel.org
, indicating the model incorporates country-specific patterns for accidents, etc.

Health Service Utilization: To model health-seeking behavior and access, TLO uses survey data like the Malawi Integrated Household Surveys. The Fourth (2016–2017) and Fifth (2019–2020) Integrated Household Surveys are listed
tlomodel.org
, which contain information on illness prevalence and care-seeking (e.g. what proportion of people sought care for a fever, and where). Additionally, research by Ng’ambi et al. on factors associated with healthcare seeking for adults and children in Malawi (2016 data) is used
tlomodel.org
. These help calibrate the HealthSeekingBehaviour module – for instance, setting probabilities that a sick child is taken to a clinic, or how distance and education affect that likelihood.

Epidemiological and Clinical Data: Each disease module relies on epidemiological parameters (incidence, prevalence, transmission rates, case fatality rates, etc.) and clinical efficacy data for interventions. The model’s Data Sources section includes extensive references for each disease. For example:

The TB module references a comprehensive list of studies, including Malawi-specific TB prevalence surveys and global reviews
tlomodel.org
. We see citations like a 2014 Bulletin of WHO article on TB in Malawi
tlomodel.org
, Cochrane reviews on latent TB treatment
tlomodel.org
 and BCG vaccine meta-analyses
tlomodel.org
, among many others. This implies the TB model is calibrated with local TB incidence and mortality, and uses evidence-based assumptions about TB/HIV coinfection, treatment outcomes, and transmission (e.g., even smear-negative TB transmission as cited
tlomodel.org
).

The HIV module would incorporate Malawi’s HIV epidemiology – likely using data from UNAIDS or the Malawi DHS HIV testing, and trials for ART efficacy. Indeed, references to Malawi’s Global AIDS Response Progress Reports 2012 and 2014 are listed under maternal care (for PMTCT perhaps)
tlomodel.org
.

For malaria, data from Malawi’s health management information or Malaria Indicator Surveys may be used (though not explicitly listed in snippet, likely included).

Childhood illnesses: The ALRI module cites sources like McAllister 2019 (perhaps on pneumonia incidence) and Lazzerini’s case fatality data
tlomodel.org
. The Diarrhea module would use WHO or IHME estimates for rotavirus etc. The Undernutrition module might use UNICEF or Malawi nutrition survey data.

Maternal & newborn: Malawi’s Standard Treatment Guidelines and Obstetric protocols are referenced
tlomodel.org
, giving local clinical management assumptions. Also the 2013-14 Service Provision Assessment (SPA) survey is cited
tlomodel.org
 which provides data on maternity service availability.

Contraception: Social science research on adherence to antenatal iron supplementation and other behaviors in Malawi is included
tlomodel.org
, informing that module.

NCDs: For chronic diseases, the model uses both local data and global studies. For example, Price et al. 2018 (Lancet Diabetes & Endo) on hypertension & diabetes prevalence in rural vs urban Malawi
tlomodel.org
, and Msyamboza et al. on Malawi’s STEPS survey 2011 for NCD risk factors
tlomodel.org
. These give baseline prevalence of conditions like hypertension and diabetes. For mental health, a 1997 Zimbabwe study on depression is referenced (likely for lack of Malawi data)
tlomodel.org
. The model also uses disability weights for various conditions (the presence of a DALY Weights.csv file suggests that
tlomodel.org
, possibly drawn from global burden of disease studies).

Health System Capacity Data: To simulate the health system realistically, TLO incorporates data on health infrastructure, workforce, and logistics. Key sources include:

The Malawi Human Resources for Health (HRH) Strategic Plan 2018–2022
tlomodel.org
, which provides targets and stats for health workers (doctors, nurses per population, etc.).

A World Bank WISN (Workforce Indicators of Staffing Need) study (Draft Final Report 2017) that analyzed HRH in 75 facilities
tlomodel.org
. WISN provides data on workload and staffing gaps, which TLO can use to calibrate how many patients one nurse can handle, etc.

The Harmonized Health Facility Assessment (HHFA) 2018-2019 for Malawi
tlomodel.org
tlomodel.org
. This comprehensive survey reports on health facility readiness (availability of medicines, equipment, facility density, etc.). The model uses this to determine, for example, what percentage of clinics have certain consumables or how far patients travel to facilities. A cited statistic in a related publication is that TLO used 2018 data on HIV/TB consumable availability across all facilities to model scale-up scenarios
tlomodel.org
. The HHFA data is exactly that kind of input – it shows the baseline of supply availability and was used in analysis of supply chain improvements
tlomodel.org
tlomodel.org
.

Health Sector Strategic Plan II (2017–2022)
tlomodel.org
, which outlines Malawi’s goals for health system strengthening, giving context for scenarios to test (like achieving certain coverage).

Master Health Facility List 2019 (Vol.3 of HHFA)
tlomodel.org
 to know how many of each level facility exist and where.

World Bank policy briefs (“Closing the Gap” 2020, “Harnessing Momentum” 2020) that identify priority areas in Malawi’s health system
tlomodel.org
tlomodel.org
. These likely influenced scenario design (for example, focusing on under-served districts or specific system investments).

Logistics systems: Mention of OpenLMIS 3.0 (2018)
tlomodel.org
 hints that data on supply chain performance (stockouts, order fulfillment rates) is used. Indeed, a study by Mohan et al. 2024 (Lancet GH) analyzed factors associated with consumable availability in Malawi’s facilities
tlomodel.org
tlomodel.org
, which directly feeds into the model’s assumptions on what improves supply chains (like having a pharmacist manage orders improved odds of stock availability
tlomodel.org
). Those findings help model the Improved_HealthSystem_and_Healthcare_Seeking scenario (there is a resource file by that name
tlomodel.org
) where certain parameters (like supply reliability) are set to “improved” values.

Intervention Efficacy: For each intervention simulated, data from clinical trials or meta-analyses are used. For instance, the effect of ART on HIV mortality, the efficacy of TB treatment, vaccine efficacies for measles or HPV, etc., are drawn from literature (some references in Data Sources likely cover these, e.g., OCV trials, BCG vaccine efficacy mentioned above
tlomodel.org
, etc.). The “DCP3” (Disease Control Priorities) is mentioned in the module development checklist
github.com
 – indicating they consult global evidence summaries for intervention impact.

In total, the model references hundreds of sources (the Publications page and Data Sources span numerous entries). The documentation even provides a downloadable BibTeX of all references
tlomodel.org
. This ensures that every assumption is traceable to evidence. For example, if the model assumes a baseline incidence of a disease, that number comes from a cited study or dataset. If it assumes a certain proportion of people seek care, that comes from a Malawi survey. Such rigor is vital for policy credibility.

Default Parameters: Based on these data, the TLO team has compiled an extensive library of default parameter values for the model. In the documentation’s Parameters section, every parameter is listed by module, with its name, description, type, and default value
tlomodel.org
tlomodel.org
. There are dozens of categories (ALRI, BladderCancer, Diabetes, Demography, etc., corresponding to the modules) and within each, potentially hundreds of parameters. For instance, the ALRI module alone includes parameters for the baseline incidence rates of pneumonia by pathogen and age group – e.g., separate incidence rates for RSV, Rhinovirus, HMPV, etc., in infants 0–11 months, 12–23 months, and 24–59 months
tlomodel.org
. As an example, the default annual incidence of RSV-associated ALRI in infants under 1 year is 0.1656 (i.e. ~0.17 episodes per child-year), dropping to 0.0369 in one-year-olds, and 0.0119 in 2–4 year-olds
tlomodel.org
. Each such number comes from epidemiological studies (in this case, likely from a respiratory virus study in the region). Similarly, the model has parameters for treatment success probabilities, case fatality rates if untreated, progression rates from latent to active TB, vaccine coverages, etc., all calibrated from data.

Modelers can modify these parameters if, for example, exploring uncertainty or adapting to another setting. By default, they represent the best estimates for Malawi circa the baseline year. The presence of so many parameters also underlines how granular the model is – it’s not using one generic value per disease, but often age-specific and cause-specific values. This allows it to capture, say, that RSV is a dominant cause of pneumonia in infants but less so in older children, etc. The default parameter table acts as a transparent repository of the model’s “assumptions” and starting values.

Calibration and Fitting: In building the model, the team likely adjusted certain parameters so that the model’s outputs match observed data (calibration). For example, after inputting all baseline incidence and service stats, they would run the model for past years (2015–2019) to see if it reproduces known indicators (e.g. total deaths by cause, facility utilization rates). The Lancet Global Health paper by Hallett et al. (2025) reports that TLO estimated how resources were used in Malawi’s health system 2015–19 and the results were plausible
tlomodel.org
tlomodel.org
. This suggests the model was able to reconstruct recent history well, giving confidence in its projections.

In summary, the TLO model is heavily data-driven. It embodies the best available evidence on Malawi’s population, diseases, and health services. By design, whenever possible it uses local Malawi data (to maximize relevance), supplemented by global data where local data are missing. This comprehensive evidence base ensures that the model’s predictions and comparisons are grounded in reality. For users (policy-makers or analysts), the transparency of sources means they can see why the model behaves as it does (for example, why does the model predict a certain outcome – one can trace it to input assumptions in the data/parameters). The depth of data also allows the model to answer nuanced questions – e.g., it can consider urban vs rural differences if those are in the data, or adjust to future demographic shifts (since it uses UN demographic projections). As new data come in (e.g. a new DHS or Census, or new trial results), the model can be updated to refine its accuracy.

Model Parameters and Configuration

Users of the TLO model – especially developers or researchers – can interact with a rich set of configurations and parameters. The model’s flexibility comes in part from how its parameters can be tuned and how scenarios are set up.

Extensive Parameter Library: As noted, the model defines default parameters for virtually every probability, rate, or coefficient used in simulation. These are organized by module. For example, under Parameters -> Alri, one finds entries like base_inc_rate_ALRI_by_RSV with its description (“baseline incidence rate of ALRI caused by RSV in age groups 0–11, 12–23, 24–59 months, per child per year”) and its value as a list of three numbers (one for each age group)
tlomodel.org
. This format (Name – Description – Type – Value) is repeated for hundreds of parameters. Types can be Real, List, Boolean, etc., and values can be scalars or lists or distributions. Some parameters define natural history (like disease incubation periods, progression probabilities), others define intervention effects (like vaccine efficacy, or reduction in risk due to an intervention), and others define system characteristics (like number of health workers per facility, or appointment durations).

For instance, the HealthSystem parameters include things like staff-to-patient ratios, bed occupancy rates, supply chain delays, etc. The Lifestyle parameters might include, say, the transition probabilities for someone to start or quit smoking each year, or the proportion of the population with access to clean water. Demography parameters include life tables for non-specific mortality and fertility rates. DALY weight parameters (from the resource file) assign disability weights to each condition to compute DALYs.

All these default values can be overridden in a scenario if needed. The model is typically run with the best-estimate defaults, and then uncertainty can be explored by varying them within plausible ranges.

Scenario Configuration: To run a specific scenario, one typically creates a scenario script in Python (or uses the command-line to specify a built-in scenario). The core of scenario configuration in TLO involves specifying: (1) the time frame of simulation, (2) the population size to simulate (for computational tractability, often a smaller “sample” population is simulated with results later scaled up), (3) which modules are active, and (4) any parameter overrides or special conditions for that scenario.

In code, a scenario is defined as a subclass of tlo.scenario.BaseScenario. For example, one might write:

class MyTestScenario(BaseScenario):
    def __init__(self):
        super().__init__()
        self.seed = 12
        self.start_date = Date(2010, 1, 1)
        self.end_date = Date(2020, 1, 1)
        self.pop_size = 1000
        self.number_of_draws = 2
        self.runs_per_draw = 2


This snippet from the documentation shows a scenario being configured to simulate 10 years (2010–2020) for a population of 1,000 individuals, using a random seed for reproducibility
tlomodel.org
. It also shows number_of_draws and runs_per_draw set to 2 each – TLO allows probabilistic sensitivity analysis by running multiple draws of parameter sets and multiple Monte Carlo runs per draw. For instance, if number_of_draws=2, it will sample two sets of uncertain parameters; and runs_per_draw=2 means for each set it runs two stochastic simulations. That yields 4 runs in total in this example. This is useful for quantifying uncertainty ranges in outcomes.

Within the scenario class, you also define:

modules(self): which returns a list of module instances that this scenario will include. For example:

    def modules(self):
        return [
            demography.Demography(resourcefilepath=self.resources),
            enhanced_lifestyle.Lifestyle(resourcefilepath=self.resources),
        ]


tlomodel.org
. This indicates the scenario will run with the Demography module and an “enhanced” Lifestyle module (perhaps one that includes more risk factors) loaded from resource files. You could add modules like tb.TB(), hiv.HIV(), healthsystem.HealthSystem(), etc., to this list depending on what you want to simulate. Scenarios can thus be incremental: you could run a baseline scenario with only some modules, and another scenario with additional modules or interventions to compare results.

draw_parameters(self, draw_number, rng): this method allows you to tweak parameters for each uncertainty draw
tlomodel.org
. For example, the snippet sets the Lifestyle.init_p_urban parameter to a random value between 10% and 20% for each draw. This could be used to sample uncertain inputs (like the initial urbanization rate of the population in this case). If not overridden, defaults are used for all draws.

log_configuration(self): defines how results will be logged (filename, output directory, and logging levels)
tlomodel.org
. In the example, it logs to a file “my_test_scenario” in the ./outputs directory at INFO level.

One can also override other BaseScenario methods to introduce custom behavior (e.g., stopping criteria, custom result processing, etc.), but the above are the main ones.

Running the Model: Once a scenario class is defined (say in src/scripts/my_test_scenario.py), you can run it. The TLO package provides a command-line interface tlo for common tasks. For a local run, you use the scenario-run command. For instance:

tlo scenario-run src/scripts/my_test_scenario.py


This will execute the simulation with default settings (using all draws and replicates specified). There’s also a --draw-only option to just generate the scenario configuration and not actually simulate (useful for testing that everything is set up correctly)
tlomodel.org
. One can target specific draws or replicates with flags (as shown by --draw 1 0 to run only a particular draw index and replicate)
tlomodel.org
.

For large-scale simulations or batch processing, TLO integrates with Azure Batch. The Azure Batch setup allows distributing runs across cloud VMs, which is useful when performing many simulations (for uncertainty or for exploring many scenarios). After some one-time setup (like installing Azure CLI, configuring credentials in a tlo.conf file, etc. as outlined in the docs
tlomodel.org
tlomodel.org
), you can submit a scenario to Azure with a single command:

tlo batch-submit src/scripts/my_test_scenario.py


This uploads the code and runs it on the cloud cluster. The CLI provides other helpful commands, for example to list jobs:

tlo batch-list will list recent jobs, and tlo batch-list --active shows active ones
tlomodel.org
.

tlo batch-job <job-id> --tasks shows details of tasks for a given job ID
tlomodel.org
.

tlo batch-download <job-id> will retrieve the output files of a completed job to your local machine
tlomodel.org
.

All tlo subcommands have a --help flag for usage info
tlomodel.org
. The documentation notes that assert statements in the code (used as sanity checks during development) are automatically disabled when running on Azure Batch to improve performance
tlomodel.org
. If one wants to run with those checks on (for debugging), an --asserts-on flag can enable them, though normally they’re unnecessary for production runs.

Outputs and Logging: During a run, the model produces log files (by default in the outputs/ directory, or in Azure’s storage if using Batch). These logs contain time-stamped events and summary statistics. The structured logging in TLO is designed so that results (like number of new cases, number of deaths, DALYs, etc. per time step) can be extracted. Indeed, TLO has an analysis sub-package with utility functions to parse logs and compute high-level results. For example, tlo.analysis.life_expectancy.get_life_expectancy_estimates() will compute life expectancies from output data
tlomodel.org
; functions like extract_results() and compute_summary_statistics() help aggregate raw simulation outputs into meaningful indicators
tlomodel.org
. There’s also tlo.analysis.hsi_events which can summarize health service usage events from logs. In practice, one might run a scenario and then use a provided Jupyter Notebook or script to load the pickled outputs and generate tables/figures (the TLO team likely has a workflow for this, given their publications with many results).

For decision-makers, typical outputs of interest are: total DALYs in each scenario, DALYs averted compared to baseline, life expectancy changes, deaths averted, cases averted, service volumes required, and costs incurred. The model can provide all of these. For instance, it can estimate how life expectancy in the population would change by year under each scenario – e.g. in one analysis it showed life expectancy gains by 2035 with certain investments
tlomodel.org
. It can report the total DALYs over a period (like 2023–2042) for different policy packages
tlomodel.org
tlomodel.org
. It can output the health system resource utilization: one publication noted how many extra patient-facing hours of healthcare workers would be required under certain scale-up scenarios
tlomodel.org
, which was directly derived from model outputs. The cost outputs allow calculation of ROI or cost/DALY: e.g. the model predicted that a joint investment scenario could avert 23.4 million DALYs at a certain cost, yielding a very high ROI (8x)
tlomodel.org
tlomodel.org
.

Stochastic Variation: Because the model is stochastic (random), each run can produce slightly different outcomes. That’s why multiple runs (replicates) are often performed to get an average result and a confidence interval. In documentation and papers, results are usually presented with uncertainty ranges (like 95% intervals), which come from those multiple runs or draws. The built-in support for multiple draws and the --seed ensure results are reproducible and variability is captured. For example, a result might be “12.21 million DALYs averted (95% UI: 11.39–14.16)” in a scenario
tlomodel.org
, indicating the range across runs.

Reproducibility and Versioning: The model version is clearly versioned (v0.1 as of late 2023) and citable
tlomodel.org
. The open-source nature means that anyone can inspect the code that defines all these behaviors. The team also provides a Wiki with further guidance – including installation help, coding conventions, and examples as mentioned
tlomodel.org
.

In summary, configuring and running the TLO model involves setting up scenarios with chosen modules and parameters, and then executing those scenarios either locally or on a cloud/cluster. The model is quite user-friendly for Python developers: after installation, they can create new scenario scripts or modify existing ones to test different policies. The CLI handles the heavy lifting of running the simulations and collecting results. The robust logging and analysis tools help make sense of the complex outputs.

Software Architecture and Contribution Guidelines

From a software development perspective, TLO is structured to facilitate collaboration and extension. The code is written in Python (over 99% Python per GitHub stats)
github.com
 and follows standard open-source project practices (with version control, continuous integration, etc.). Here we outline how the codebase is organized and how new contributions (like adding a disease module) can be made:

Code Organization: The repository has a clear layout
github.com
:

The main model code resides in the src/tlo/ directory. Within this, key packages include:

tlo.methods – containing all the disease/condition modules (each as a Python module). For example, tlo.methods.tb for tuberculosis, tlo.methods.malaria, tlo.methods.healthsystem, etc. A template file skeleton.py in this package provides a starting structure for new modules
github.com
. Each module typically defines a class (e.g. TB or HIV) inheriting from a base class (possibly a generic Disease or Module class) and implements the logic for that condition.

tlo.scenario – defines the BaseScenario class and related functionality for scenario configuration
tlomodel.org
.

tlo.simulation – probably contains the engine that advances the simulation through time and coordinates modules.

tlo.population – might define the Person or Population classes that hold individual attributes and list of persons.

tlo.events – possibly defines event objects for scheduling (since it’s an event-driven simulation).

tlo.logging – custom logging utilities to record simulation events and results.

tlo.analysis – functions to post-process logs as discussed.

tlo.cli – the command-line interface implementation for the tlo tool.

Other sub-packages for utilities, progress bars, dependency management, etc., as listed in the reference index
tlomodel.org
tlomodel.org
.

The resources/ directory holds all the CSV and data files for model inputs (e.g. ResourceFile_TB.csv, the costing files
tlomodel.org
, etc.). According to conventions, if a new module has many data files, one can create a subfolder in resources for it
github.com
. Each ResourceFile_X.csv corresponds to a module’s parameters or input data in a structured form.

The docs/ folder contains the documentation source (likely reStructuredText or Markdown) and the Word docs/PDFs for module descriptions
tlomodel.org
. Indeed, the links in documentation to .docx for each module suggest those files are stored in docs/write-ups/
github.com
. Contributors adding a module are expected to write a “write-up” document describing it, placed here (with filename matching the module)
github.com
.

The tests/ directory contains automated tests (using pytest). For each module, there should be corresponding test files (prefixed with test_ for each module’s functionality)
github.com
. New features or modules should include tests to ensure they work and to guard against future regressions.

The outputs/ folder is a default output target for logs (usually created at runtime; not stored in git).

Project configuration files like requirements/ (for dependencies), tox.ini (for testing and docs building), and CI configuration (GitHub Actions workflows) are present for development workflow.

Coding Conventions: The project maintainers have established conventions to keep the codebase consistent and understandable
github.com
. Some key guidelines include:

File and Class Naming: Modules (in tlo.methods) are named by disease/area, with CamelCase class names. For example, tb.py contains a class TB. Resource files for a module are prefixed with ResourceFile_, e.g. ResourceFile_TB.csv
tlomodel.org
. Test files are similarly named after the module (e.g. test_tb.py). This uniformity helps quickly locate related code and data.

Design of Modules: Each disease module typically has methods to initialize individuals with that condition, progress the disease state each time step, handle outcomes (recovery, death), and generate health system events. The Checklist for Developing a Disease Module provides a step-by-step process for contributors
github.com
github.com
. It starts from defining the disease scope and reviewing literature, through implementation, to final validation.

Phases of Module Development: According to the checklist, there are defined phases: Phase 1: Initial Design (define disease and interventions in scope, gather experts, literature)
github.com
, Phase 2: Full Design (compile all data, specify all parameters)
github.com
, Phase 3: Review (get team feedback on the design), Phase 4: Implementation (coding the module following skeleton and conventions), and Phase 5: Finalisation (testing and documentation)
github.com
. This structured approach ensures that by the time code is written, the contributor has a clear idea of how the disease works and what data to use.

Dependencies Between Modules: Some modules depend on others (e.g., the TB module might depend on the HIV module if simulating co-infection). The wiki page Specifying dependencies between modules likely guides how to ensure modules initialize in the correct order or share information
github.com
. Indeed, in code, one module can call another’s functions or check attributes on the Person; and a scenario switcher module exists (scenario_switcher) to turn certain interventions on/off mid-run
tlomodel.org
.

Use of LinearModel for calibration: The reference to a LinearModel helper class
github.com
 suggests some submodels are solved analytically or via linear equations (perhaps for quick estimation or calibration). Contributors are directed on using it if needed.

Logging and DataFrames: The wiki has tips on working with pandas DataFrames for analysis and a Cookbook of common tasks
github.com
, helping new developers extract the info they need.

Performance considerations: Simulating an entire population can be heavy, so the code likely uses vectorized operations or efficient looping in parts. The Improving Performance of HealthSystem Module page indicates ongoing optimization efforts
github.com
. They might use numpy/pandas for number-crunching where possible. Also, the ability to simulate a smaller population and scale results is key (instead of simulating all 18 million Malawians, one might simulate 100k and then weight the results).

Contribution Workflow: The project maintainers welcome contributions, and they have documented how to do so properly (in the CONTRIBUTING.md and wiki):

For any bug report or issue, they request details like OS, environment, and steps to reproduce
tlomodel.org
. The GitHub issues page is active (200+ issues have been opened)
github.com
.

For new features or modules, one should start by forking the repository and creating a feature branch
tlomodel.org
tlomodel.org
. If the contributor has direct access, they can branch off the main repo.

After implementing changes, run all tests with tox (which likely runs unit tests across supported Python versions, plus checks docs and style)
tlomodel.org
. The contributor is expected to ensure all tests pass before merging. The guidelines explicitly state to include passing tests for any new code
tlomodel.org
.

Documentation must be updated for new APIs or modules
tlomodel.org
. This means writing the module’s documentation and listing any new references.

Add yourself to authors.rst (the project acknowledges contributors in the docs)
tlomodel.org
.

Then push the branch and open a Pull Request (PR) on GitHub. The maintainers will review the code. They mention you can open a PR even if work is ongoing to get feedback early
tlomodel.org
.

Once a PR is open, GitHub Actions will run the full test suite on it (covering multiple Python versions, etc.)
tlomodel.org
. The contributor should monitor that and fix any failing tests. They note it might be slower than local, but ensures a clean bill of health.

After approval, the PR can be merged, integrating the contribution.

This process ensures high code quality and reliability. The existence of 50+ pull requests in the tracker
github.com
 shows active development and community involvement.

Developers Onboarding: The wiki contains an Introduction to PyCharm, Git, and GitHub
github.com
 for those new to these tools, and a Developer onboarding guide (mentioned in the table of contents)
github.com
. This lowers the barrier for new researchers (who may be domain experts but not software experts) to contribute. There’s also a Checklist Before PR for a New Module
github.com
github.com
 which likely ensures nothing is missed (tests, docs, formatting, integration with existing components, etc.).

Community and Collaboration: The project’s Contributors page lists over 30 individuals across disciplines – epidemiologists, health economists, software developers, etc. – who have contributed to TLO
tlomodel.org
tlomodel.org
. The scientific leads include experts in epidemiology (Andrew Phillips), health economics (Paul Revill, Martin Chalkley), and development (Asif Tamuri as lead developer)
tlomodel.org
. This interdisciplinary team is reflected in the code: epidemiologists ensure disease realism, economists ensure cost and decision relevance, and developers ensure the platform is robust and extensible.

The collaboration also extends to policy translation experts in Malawi (Joseph Mfutso-Bengo, Dominic Nkhoma)
tlomodel.org
tlomodel.org
 to keep the model relevant to actual policy processes. Regular meetings and a Slack channel are used for ongoing discussions on modules
github.com
. This means contributions are often coordinated – e.g., if someone is adding a cancer model, they’ll engage with the clinicians or researchers who have that expertise.

Releases and Version Control: The repository has tagged releases (at least 3 releases by 2025)
github.com
, with release notes named after major analyses (e.g., one release is titled “Mangal - System-wide Investments” May 7, 2025, likely corresponding to a particular study)
github.com
. This suggests that whenever a big policy analysis is done and the model is tweaked for it, they cut a release. The Zenodo DOI given is for v0.1 in Nov 2023
tlomodel.org
, which might correspond to an initial public release of the model’s code and documentation.

With these practices, the TLO Model’s codebase remains sustainable and transparent. Interested developers can dive in knowing there’s a structure to follow and help available in the wiki. The combination of rigorous contribution rules and active engagement by the core team means that the model will continue to improve and expand (for example, adding new diseases or adapting to other countries could be future steps).

In summary, for a developer, TLO is a well-organized project: set up the environment, read the wiki for conventions, and you can extend the model to new problems. For a policymaker or analyst, the benefit is that this rigorous software process yields a dependable tool – one that has been tested and peer-reviewed – giving confidence that the insights derived are based on solid code and data, not a black-box model.

Key Findings and Applications of TLO Model

While the TLO Model is a technical tool, its value is ultimately measured by the real-world insights it provides. Indeed, TLO has already been applied to several high-priority policy questions in Malawi. These case studies demonstrate the model’s capability to compare complex scenarios and have yielded findings that are directly informing decision-makers. We highlight a few major analyses (all involving Malawian health policy) that utilized TLO:

1. Vertical Disease Programs vs. Health System Strengthening (Integrated Investment): One of the central debates in global health finance is how to allocate resources between disease-specific programs (like HIV, TB, malaria – often funded vertically by donors) and broader health system investments (like training more health workers or improving supply chains). The TLO Model was used to evaluate this in the Malawian context.

Study setup: The model simulated Malawi’s health outcomes under different investment strategies over an 11-year period. Strategies included scaling up HIV, TB, and Malaria programs (“HTM” programs) versus scaling up cross-cutting system capacity (workforce and supplies), and a combination of both
tlomodel.org
.

Findings: Strengthening the general health system had enormous health benefits. Increasing the number of healthcare workers by 6% per year (compounded) was projected to prevent about 14% of all DALYs over the period – a very large health gain
tlomodel.org
. Even focusing on just primary care level workers yielded a ~5% DALY reduction
tlomodel.org
. Likewise, improving the supply chain and availability of medical consumables to top-program standards (e.g., making every program run as reliably as the immunization program) could prevent ~9% of DALYs
tlomodel.org
. These are substantial gains in population health.

In terms of cost-effectiveness, these system investments were extremely attractive. The model calculated the return on investment (ROI): for the workforce scale-up, an ROI as high as 8:1 was estimated (meaning $1 invested returns health benefits worth $8 in economic terms)
tlomodel.org
. Improving supply chains also showed a strong ROI (exact figure not given, but qualitatively “strong”)
tlomodel.org
. These results emphasize that investing in fundamental health system capacity yields broad health improvements and is highly cost-effective.

On the other hand, scaling up the disease-specific HIV, TB, and malaria programs alone did yield health improvements (the model showed reductions in those diseases’ burdens), but their impact was limited by health system bottlenecks
tlomodel.org
. For example, even if funding for HIV/TB is increased, if there aren’t enough healthcare workers or diagnostic tests, not all patients will benefit. TLO quantified this: it found that if HIV, TB, malaria interventions were scaled up without addressing system constraints, tens of thousands of preventable deaths would still occur due to those constraints (e.g., ~58,700 additional deaths over 10 years compared to a scenario with no stockouts and full staffing)
tlomodel.org
tlomodel.org
.

The most striking result was when combining approaches: a “joint approach” that scaled up HTM disease programs and simultaneously invested in health workforce and supplies produced the greatest benefit. According to the model, the combined scenario could avert an additional 12% of DALYs compared to scaling disease programs alone
tlomodel.org
. In absolute terms, this integrated strategy was estimated to avert 23.4 million DALYs in Malawi over the 11 years, with about 70% of those health gains coming from reductions in diseases beyond just HIV, TB, malaria (meaning the system improvements helped all health issues, not just the three targeted diseases)
tlomodel.org
. The ROI of the combined strategy was significantly higher than focusing on vertical programs alone
tlomodel.org
. Essentially, TLO showed that health system strengthening multiplies the impact of disease-specific funding – a crucial evidence point for policy. This finding has been visually summarized in the study by a figure showing the ROI for vertical programs with and without system investments (the figure illustrates how the ROI bar jumps much higher with the combined approach)
tlomodel.org
.

Policy impact: These insights support a re-balancing of investments. They suggest donors and the government should not only fund HIV/TB/malaria commodities, but also invest heavily in training and hiring health workers and improving supply logistics. The Malawi Ministry of Health and partners have taken note – such evidence underpins arguments for increasing the health workforce (Malawi has a chronic shortage of clinicians and nurses) and for integrating vertical program support with system support. It also provides quantitative targets (e.g., a 6% annual HRH scale-up) to aim for in strategic plans.

2. Health Benefits Package (HBP) Design – Optimal Prioritization of Services: Malawi, like many countries, periodically updates its essential health benefits package – the set of services the government pledges to provide universally. Deciding which services to include or emphasize, under severe resource constraints, is challenging. TLO was applied to evaluate different HBP prioritization strategies:

Study setup: Researchers formulated several plausible policy approaches for allocating a fixed health budget. These included: LCOA (Linear Constrained Optimization Analysis) – essentially the status quo method focusing on cost-effectiveness (maximize health gains per cost until budget is exhausted, a method that tends to fund the most cost-effective interventions first)
tlomodel.org
; CV (Clinically Vulnerable) – prioritizing services for the most vulnerable groups (like maybe children, elderly, etc.); VP (Vertical Programs) – focusing on key programs (HIV, TB, malaria, immunization) as a priority; and others including an RMNCH-focused package, etc.
tlomodel.org
tlomodel.org
. TLO then simulated the population health outcomes over ~20 years (2023–2042) for each policy scenario, given realistic human resource constraints (so it’s not just assuming interventions magically scale; the model considered if there are enough staff to implement them).

Findings: Several of the prioritized packages did better than a “no prioritization” scenario (where limited resources are spread thinly across everything)
tlomodel.org
. In particular, the LCOA policy (optimization-based) achieved the largest overall health gain – about an 8% reduction in DALYs from 2023 to 2042 compared to the status quo (no specific prioritization)
tlomodel.org
. It did so by concentrating resources on high-impact, cost-effective treatments (which is what an optimization algorithm would choose). This result validates that Malawi’s existing approach (which is to use cost-effectiveness analysis like in DCP studies) yields substantial benefits.

However, an interesting nuance was observed: the LCOA strategy, while best overall, incurred a “DALY penalty” in the early years – i.e., it caused a temporary worsening in health outcomes before improvements kicked in
tlomodel.org
tlomodel.org
. This was because focusing resources on certain high-impact areas meant other services were initially neglected, causing short-term rises in those neglected areas’ burden. Over time, the gains outweighed the losses, but this finding highlights a potential political issue (short-term pain for long-term gain).

Another policy examined was one focusing on Reproductive, Maternal, Newborn, and Child Health (RMNCH) services. Surprisingly, the model found that this policy did not perform well – in fact, it led to an increase in DALYs (worsened outcomes) relative to no prioritization
tlomodel.org
. This counter-intuitive result implies that pouring resources into RMNCH at the expense of other services might cause negative trade-offs elsewhere (perhaps because other lethal conditions like adult diseases or infectious diseases in adults get less funding, causing more deaths that outweigh RMNCH gains). It underscores that well-intentioned priorities can backfire if not evaluated holistically. In the model, the RMNCH-focused scenario likely neglected things like HIV or emergency care for injuries, leading to overall worse outcomes.

Meanwhile, a policy focusing on clinically vulnerable groups (like maybe a pro-poor or high-risk approach) and the one focusing on the big three diseases (VP) both showed better health outcomes than doing nothing, but not as much as the LCOA optimal solution
tlomodel.org
.

Policy impact: These findings demonstrate the utility of TLO for health planning. The Government of Malawi, through bodies like the Essential Health Package task force, can use these results to inform how they update the HBP. The fact that a pure cost-effectiveness approach gave the best results (and by quantifying that gain ~8%) provides evidence to continue using that approach, but with caution about short-term effects. The poor result of the RMNCH-only focus was an important insight – it suggests that a balanced investment across the health system may be wiser than over-prioritizing one category of care. This kind of analysis had been published (Molaro et al. 2024 in PLOS Computational Biology)
tlomodel.org
tlomodel.org
 and provides a case study for using simulation to test national health strategies before implementation. It also illustrates the complex interactions TLO can capture – e.g., saving mothers and children is crucial, but not if it means neglecting anti-retroviral therapy for HIV which could lead to a resurgence of AIDS deaths that outweigh maternal gains (for instance). The model helps find a mix that maximizes overall health.

3. Long-Term Impacts of Health Spending Changes (Declining Donor Funding): Malawi’s health sector is heavily financed by donors (development assistance for health). There is concern that as Malawi’s economy grows or donor priorities shift, external funding may plateau or decline, which could reduce health services if not replaced by domestic funds. TLO was used to project what different health expenditure scenarios mean for population health.

Study setup: Researchers defined scenarios where health spending as a share of GDP follows different trajectories: stays at current level, increases moderately, or decreases as forecasted by IHME (Institute for Health Metrics and Evaluation) over the next two decades
tlomodel.org
tlomodel.org
. These scenarios reflect possibilities like donors pulling back funds (which would lower health spending/GDP) versus government increasing health budgets. TLO then simulated 2019–2040 under these scenarios, taking into account that if money is tight, the health workforce might not grow, drug supply might falter, etc., thereby constraining the model’s HealthSystem capacity.

Findings: Health outcomes are highly sensitive to health spending levels. The model estimated that for each 1% increase in annual healthcare spending (as % of GDP), about 10 million DALYs would be averted between 2019 and 2040
tlomodel.org
. In other words, greater investment yields significant health gains – roughly proportional up to a point. However, diminishing returns set in beyond a certain level: the benefits per additional percent of GDP started to drop once spending exceeded ~+4% of GDP above current levels
tlomodel.org
. The reason, as TLO elucidated, is that at higher funding levels the system begins to saturate the most cost-effective interventions and faces residual issues that money alone can’t immediately solve (like behavioral factors, or the natural limits of intervention efficacy)
tlomodel.org
. In the model, after addressing the biggest needs (e.g., basic infections, maternal care), further money has to tackle harder problems (like NCDs with expensive treatments or illnesses with no easy cure), yielding less DALY per dollar. The model explicitly captures factors like imperfect healthcare access in remote areas, diagnostic gaps, and so on, which is why pouring more money eventually has less effect
tlomodel.org
.

Conversely, the impact of funding cuts is severe. If, as IHME predicts, external aid decreases and Malawi’s health spending (% of GDP) drops, the model projected a 7% to 16% increase in total DALYs over 2019–2040 relative to a scenario of steady funding
tlomodel.org
. Essentially, reduced funding could cause thousands more to fall sick or die – a regression in health progress. Notably, TLO pointed out that much of the increased ill health would come from reversals of gains in areas that had improved, such as RMNCH, malaria, and TB outcomes
tlomodel.org
. These are areas where Malawi had made progress (often with donor support), and cuts would risk backsliding on that progress. Chronic non-communicable diseases were projected to rise regardless of scenario (due to aging and epidemiologic transition), but the acute jump in communicable and maternal/child issues was linked to funding scenarios
tlomodel.org
tlomodel.org
.

One tangible outcome reported was life expectancy differences: a figure in the case study shows life expectancy under different spending scenarios diverging, with the lower-spending scenario yielding several years lower life expectancy by 2040 than the maintained-spending scenario
tlomodel.org
.

Policy impact: This analysis (published as Molaro et al. 2025 in PLOS Medicine) is the first to quantify the long-term health impacts of aid reduction for Malawi
tlomodel.org
tlomodel.org
. It effectively warns policy-makers that failing to replace donor funds with domestic funds could erase years of health gains and lead to significantly worse outcomes by 2040. It underscores the need for proactive planning: either improving efficiency drastically or increasing domestic health financing to avoid the projected 7–16% increase in disease burden
tlomodel.org
. For donors and international partners, it provides evidence to advocate for sustained support or at least a gradual transition (so Malawi has time to ramp up its own spending). The model’s finding of diminishing returns beyond +4% GDP is also informative – it suggests Malawi doesn’t necessarily need to spend, say, European-level health budgets to see major improvements; a moderate increase, well-utilized, could yield big benefits, but after a point other sectors or approaches (education, infrastructure) might be needed to drive further health improvements.

These case studies demonstrate TLO’s versatility: it has been used to analyze health systems investments, service package design, and health financing – three distinct but critical policy domains. In each case, it provided quantitative estimates of outcomes (DALYs, deaths, life expectancy) and sometimes economic metrics (ROI, cost per outcome) that feed directly into policy documents (e.g., Malawi’s Vision 2063 health goals, investment plans, HSSP (Health Sector Strategic Plans), and donor strategies).

Beyond Malawi, the methodology can be extended to other low-income settings, especially in sub-Saharan Africa, with appropriate data. The general approach – combining all diseases and the health system in an IBM – is somewhat unique. Traditional models might not capture the interactions that TLO does, hence wouldn’t reveal things like “an RMNCH-focused policy could worsen overall health” or “vertical programs alone miss 70% of possible benefits.” By showcasing these insights, TLO has attracted attention globally. Indeed, its results have been shared at international conferences and in global health forums. It represents a new class of decision-support tool for health ministries.

Publications and Recognition: The TLO Model’s findings have been published in top venues:

The Lancet Global Health featured an overview of the model and a study on resource use and service strengthening
tlomodel.org
tlomodel.org
.

PLOS Medicine published the health expenditure impact study
tlomodel.org
tlomodel.org
.

Bulletin of the WHO published the analysis of a decade of HIV, TB, malaria initiatives with and without system investment
tlomodel.org
tlomodel.org
.

PLOS Computational Biology published the HBP design study
tlomodel.org
tlomodel.org
.

Others in development include studies on specific interventions (e.g., pulse oximetry for child pneumonia was analyzed – Lin et al. 2025 in Lancet GH – using TLO to show its impact and cost-effectiveness
tlomodel.org
tlomodel.org
).

This growing list of publications (the docs list ~15 major papers as of 2025
tlomodel.org
tlomodel.org
tlomodel.org
 etc.) not only disseminates the findings but also validate the model’s credibility through peer review. The involvement of stakeholders like the Malawi Ministry of Health in co-authoring some studies (Gerald Manthalu and others are co-authors) suggests strong local buy-in.

Learning and Capacity Building: The TLO initiative isn’t just about running analyses; it’s also building local capacity. For policy-makers and analysts in Malawi and the region, the team has developed a course on individual-based modeling for health policy
tlomodel.org
. This self-paced tutorial (hosted on the TLO website) teaches the basics of building an agent-based model through Google Colab notebooks, starting from simple loops to adding complexity like interventions and measuring outcomes
tlomodel.org
tlomodel.org
. The aim is to demystify the modeling for non-modelers, so that policy-makers and local researchers can better understand and even contribute to models like TLO. Additionally, the Global Health Economics Network resources and other recommended readings on modeling are provided in the Learning Resources page
tlomodel.org
tlomodel.org
, which includes literature on agent-based modeling in public health, systems science, and best practices for modeling studies
tlomodel.org
tlomodel.org
. This indicates the project’s commitment to transparency and education – acknowledging that model outcomes should be scrutinized and understood by a broad audience, not just by modelers.

Future Directions: TLO Model is still at version 0.1 (development dev version in documentation suggests continuous updates). Future expansions could include more granular geographic modeling (e.g., region-specific parameters for Malawi’s districts), integration of climate or economic scenarios (since macro factors affect health), and adaptation to other countries under the “Health for All” concept. The generalizable architecture means a lot of the core (like Demography, HealthSystem) could be applied to any low-income country with new data, making TLO a potential template for other national models.

To conclude, the Thanzi La Onse Model serves as a comprehensive decision support tool for health policy-makers and a research platform for health systems analysts. It combines the best of epidemiology (disease modeling), health economics (cost and DALY calculations), and systems science (capacity constraints and behavioral feedbacks) into one framework. For policy-makers, it provides a virtual testing ground for policies before they are implemented in the real world – highlighting unintended consequences and quantifying expected benefits. For developers and researchers, it offers a rich, extensible codebase to explore “what-if” scenarios and to incorporate the latest data or methods. The collaborative, open-source nature ensures that it can continuously improve, incorporating new knowledge (for example, if a new treatment for an illness emerges, that can be added and its impact tested quickly).

The motto “Thanzi La Onse – Health for All” also underscores the ultimate goal: to use rigorous science and data to achieve equitable health improvements. By helping allocate scarce resources more efficiently and effectively, the TLO Model directly contributes to the pursuit of universal health coverage and better health outcomes in Malawi and potentially beyond. Each result – whether it’s an 8% DALY reduction here, or 10 million DALYs saved there – translates to thousands of lives improved or saved. And that is the real measure of the model’s success: enabling evidence-informed policies that bring tangible health benefits to all.

Sources:

Collaboration and funding of TLO
tlomodel.org
tlomodel.org

Fundamental aim and model purpose
tlomodel.org
tlomodel.org

Objective: representing each step of health gain generation
tlomodel.org
tlomodel.org

Model described as whole-population, all-disease, whole-system IBM
tlomodel.org

Integration of disease modeling with health system capacity
tlomodel.org
tlomodel.org

Core modules (Demography, Lifestyle, Symptom, HealthSeeking, HealthBurden)
tlomodel.org
tlomodel.org

HealthSystem module description
tlomodel.org

Modules: Contraception, Maternal/Newborn health
tlomodel.org

Modules: Childhood ALRI, Diarrhea, Undernutrition
tlomodel.org

Modules: Communicable diseases (HIV, TB, Malaria, Measles, Schisto)
tlomodel.org

Modules: Cancers and other NCDs
tlomodel.org
tlomodel.org

Modules: Other NCD conditions (COPD, depression, etc.)
tlomodel.org

Health system interaction events explained
tlomodel.org

Example HSI event (Bladder cancer treatment requiring major surgery & bed-days)
tlomodel.org

Data sources: Malawi DHS surveys
tlomodel.org
, Census 2018
tlomodel.org
, UN Pop Prospects
tlomodel.org
, GBD 2017
tlomodel.org

Data: Health-seeking behavior studies and surveys
tlomodel.org
tlomodel.org

Data: NCD risk factor studies (Malawi STEPS, etc.)
tlomodel.org

Data: Human Resources Strategic Plan & WISN study
tlomodel.org

Data: World Bank facility assessment & strategy docs
tlomodel.org
tlomodel.org

Example of TB module references (Malawi TB study, etc.)
tlomodel.org

Parameters documentation (example ALRI incidence by pathogen)
tlomodel.org

Installation and setup commands (conda, pip)
tlomodel.org

Example scenario code snippet (dates, pop_size, draws)
tlomodel.org

Example scenario modules list and parameter variation
tlomodel.org
tlomodel.org

Azure Batch usage notes (help flag, asserts off)
tlomodel.org
tlomodel.org

Contributing guidelines (tests passing, update docs, add authors)
tlomodel.org

Code conventions: file locations for module, resource, test, docs, scripts
github.com

Contributors and roles (Scientific lead, etc.)
tlomodel.org
tlomodel.org

Case study 1 (Vertical vs System): workforce +6%/yr prevents ~14% DALYs
tlomodel.org
, ROI ~×8
tlomodel.org
, combined approach +12% DALYs averted (23.4M DALYs) vs vertical-alone
tlomodel.org
.

Case study 2 (HBP design): LCOA ~8% DALY reduction
tlomodel.org
, RMNCH policy increased DALYs (worse outcomes)
tlomodel.org
.

Case study 3 (Funding decline): +1% GDP in health spending → ~10 million DALYs saved
tlomodel.org
; beyond +4% GDP returns diminish
tlomodel.org
; IHME-projected cuts → 7–16% increase in DALYs and reversing gains in RMNCH, malaria, TB
tlomodel.org
.`;

    if (knowledgeBaseContent) {
      systemPrompt += `\n\nYou have also been provided with the following information from documents in a knowledge base. Use this to supplement your knowledge and answer user questions. If the user's question is not covered by the information, state that you do not have information on that topic based on the provided documents.\n${knowledgeBaseContent}`;
    } else {
      systemPrompt += `\nThe knowledge base is currently empty. Answer questions to the best of your ability based on the framework description provided.`
    }

    const promptParts: any[] = [];

    if (attachment) {
      if (attachment.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // It's a .docx file, extract text content.
        const base64Data = attachment.dataUri.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const { value: docxText } = await mammoth.extractRawText({ buffer });
        
        // Prepend the document context to the prompt parts array
        promptParts.push({
          text: `Please use the following document to answer the user's question. DOCUMENT CONTENT: """${docxText}"""\n\nUSER QUESTION: ${message}`,
        });

      } else {
        // For other file types (like images), add the data URI as a media part.
        promptParts.push({text: message});
        promptParts.push({ media: { url: attachment.dataUri } });
      }
    } else {
      promptParts.push({ text: message });
    }

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      history: history,
      prompt: promptParts,
    });
    
    return { response: text };
  }
);
